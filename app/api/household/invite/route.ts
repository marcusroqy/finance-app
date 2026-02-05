import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

// POST - Criar convite
export async function POST(request: Request) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Verificar se é owner
    const { data: membership } = await supabase
        .from("household_members")
        .select("household_id, role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single()

    if (!membership) {
        return NextResponse.json({ error: "Only owners can invite members" }, { status: 403 })
    }

    // Verificar se já existe convite pendente para este email
    const { data: existingInvite } = await supabase
        .from("household_invites")
        .select("id")
        .eq("household_id", membership.household_id)
        .eq("email", email.toLowerCase())
        .eq("status", "pending")
        .single()

    if (existingInvite) {
        return NextResponse.json({ error: "Invite already sent to this email" }, { status: 400 })
    }

    // Verificar se email já é membro
    const { data: existingMember } = await supabase
        .from("household_members")
        .select(`
            user_id,
            profiles:user_id (email)
        `)
        .eq("household_id", membership.household_id)

    const isMember = existingMember?.some(m =>
        (m.profiles as any)?.email?.toLowerCase() === email.toLowerCase()
    )

    if (isMember) {
        return NextResponse.json({ error: "User is already a member" }, { status: 400 })
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString("hex")

    // Criar convite
    const { data: invite, error } = await supabase
        .from("household_invites")
        .insert({
            household_id: membership.household_id,
            email: email.toLowerCase(),
            invited_by: user.id,
            token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Retornar link de convite
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://finance-app-sepia-one.vercel.app'}/invite/${token}`

    return NextResponse.json({
        invite,
        inviteLink
    })
}

// DELETE - Cancelar convite
export async function DELETE(request: Request) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const inviteId = searchParams.get("id")

    if (!inviteId) {
        return NextResponse.json({ error: "Invite ID required" }, { status: 400 })
    }

    // Verificar se é owner
    const { data: membership } = await supabase
        .from("household_members")
        .select("household_id, role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single()

    if (!membership) {
        return NextResponse.json({ error: "Only owners can cancel invites" }, { status: 403 })
    }

    const { error } = await supabase
        .from("household_invites")
        .delete()
        .eq("id", inviteId)
        .eq("household_id", membership.household_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
