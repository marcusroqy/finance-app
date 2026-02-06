import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

// GET - Obter household do usuário atual
export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Household API] User ID:", user.id)

    // First, check if user has a household membership
    const { data: membership, error: membershipError } = await supabase
        .from("household_members")
        .select("household_id, role")
        .eq("user_id", user.id)
        .single()

    console.log("[Household API] Membership:", membership, "Error:", membershipError)

    if (membershipError || !membership) {
        // User doesn't have a household - create one for them
        console.log("[Household API] No household found, creating one...")

        const { data: newHousehold, error: createError } = await supabase
            .from("households")
            .insert({ name: "Minha Família", created_by: user.id })
            .select()
            .single()

        if (createError) {
            console.log("[Household API] Create household error:", createError)
            return NextResponse.json({ error: "Failed to create household: " + createError.message }, { status: 500 })
        }

        // Add user as owner
        const { error: addMemberError } = await supabase
            .from("household_members")
            .insert({ household_id: newHousehold.id, user_id: user.id, role: "owner" })

        if (addMemberError) {
            console.log("[Household API] Add member error:", addMemberError)
            return NextResponse.json({ error: "Failed to add member: " + addMemberError.message }, { status: 500 })
        }

        return NextResponse.json({
            household: newHousehold,
            role: "owner",
            members: [{ id: user.id, user_id: user.id, role: "owner", profiles: { email: user.email } }],
            pendingInvites: []
        })
    }

    // Get household details
    const { data: household } = await supabase
        .from("households")
        .select("*")
        .eq("id", membership.household_id)
        .single()

    // Get all members (simple query)
    const { data: members } = await supabase
        .from("household_members")
        .select("id, user_id, role, joined_at")
        .eq("household_id", membership.household_id)

    // Manual Fetch Profiles to avoid FK issues
    let enrichedMembers = members || [];
    if (members && members.length > 0) {
        const userIds = members.map(m => m.user_id);
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", userIds);

        if (profiles) {
            enrichedMembers = members.map(m => ({
                ...m,
                profiles: profiles.find(p => p.id === m.user_id) || null
            }));
        }
    }

    // Get pending invites
    const { data: invites } = await supabase
        .from("household_invites")
        .select("*")
        .eq("household_id", membership.household_id)
        .eq("status", "pending")

    return NextResponse.json({
        household,
        role: membership.role,
        members: enrichedMembers,
        pendingInvites: invites || []
    })
}

// PUT - Atualizar nome do household
export async function PUT(request: Request) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Verificar se é owner
    const { data: membership } = await supabase
        .from("household_members")
        .select("household_id, role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single()

    if (!membership) {
        return NextResponse.json({ error: "Only owners can update household" }, { status: 403 })
    }

    const { data, error } = await supabase
        .from("households")
        .update({ name })
        .eq("id", membership.household_id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
