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

    // Buscar household do usuário com membros
    const { data: membership, error: membershipError } = await supabase
        .from("household_members")
        .select(`
            household_id,
            role,
            households (
                id,
                name,
                created_by,
                created_at
            )
        `)
        .eq("user_id", user.id)
        .single()

    if (membershipError || !membership) {
        return NextResponse.json({ error: "No household found" }, { status: 404 })
    }

    // Buscar todos os membros do household
    const { data: members } = await supabase
        .from("household_members")
        .select(`
            id,
            user_id,
            role,
            joined_at,
            profiles:user_id (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("household_id", membership.household_id)

    // Buscar convites pendentes
    const { data: invites } = await supabase
        .from("household_invites")
        .select("*")
        .eq("household_id", membership.household_id)
        .eq("status", "pending")

    return NextResponse.json({
        household: membership.households,
        role: membership.role,
        members: members || [],
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
