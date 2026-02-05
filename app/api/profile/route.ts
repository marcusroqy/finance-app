import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Attempt to fetch profile
    let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // If profile doesn't exist yet, we might return just email from auth or basic info
    if (error && error.code === 'PGRST116') {
        return NextResponse.json({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || ''
        })
    }

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Merge with email from auth just in case
    return NextResponse.json({ ...data, email: user.email })
}

export async function PUT(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { full_name, avatar_url, website } = body

    const updates = {
        id: user.id,
        full_name,
        avatar_url,
        website,
        updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
        .from('profiles')
        .upsert(updates)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
