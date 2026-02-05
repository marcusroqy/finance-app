import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
    params: Promise<{ token: string }>
}

// GET - Verificar convite por token
export async function GET(request: Request, { params }: RouteParams) {
    const { token } = await params
    const supabase = await createClient()

    const { data: invite, error } = await supabase
        .from("household_invites")
        .select(`
            *,
            households (
                id,
                name
            )
        `)
        .eq("token", token)
        .single()

    if (error || !invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
        return NextResponse.json({ error: "Invite expired", status: "expired" }, { status: 400 })
    }

    // Check if already used
    if (invite.status !== "pending") {
        return NextResponse.json({ error: "Invite already used", status: invite.status }, { status: 400 })
    }

    return NextResponse.json({
        invite: {
            id: invite.id,
            email: invite.email,
            household: invite.households,
            expires_at: invite.expires_at
        }
    })
}

// POST - Aceitar convite
export async function POST(request: Request, { params }: RouteParams) {
    const { token } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "You must be logged in to accept invite" }, { status: 401 })
    }

    // Buscar convite
    const { data: invite, error: inviteError } = await supabase
        .from("household_invites")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single()

    if (inviteError || !invite) {
        return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 })
    }

    // Verificar se o email do usuário corresponde ao convite
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
        return NextResponse.json({
            error: "This invite was sent to a different email address",
            inviteEmail: invite.email
        }, { status: 403 })
    }

    // Verificar se já é membro de algum household
    const { data: existingMembership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .single()

    if (existingMembership) {
        // Remover do household anterior
        await supabase
            .from("household_members")
            .delete()
            .eq("user_id", user.id)
            .eq("household_id", existingMembership.household_id)

        // Migrar transações para o novo household
        await supabase
            .from("transactions")
            .update({ household_id: invite.household_id })
            .eq("user_id", user.id)
    }

    // Adicionar como membro
    const { error: memberError } = await supabase
        .from("household_members")
        .insert({
            household_id: invite.household_id,
            user_id: user.id,
            role: "member"
        })

    if (memberError) {
        return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    // Marcar convite como aceito
    await supabase
        .from("household_invites")
        .update({ status: "accepted" })
        .eq("id", invite.id)

    // Atualizar transações existentes do usuário para o novo household
    await supabase
        .from("transactions")
        .update({ household_id: invite.household_id })
        .eq("user_id", user.id)

    return NextResponse.json({ success: true })
}
