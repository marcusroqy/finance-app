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

    // Prepared auth data
    const authData = {
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        email: user.email
    };

    // If profile missing, create it now (Self-Heal)
    if (error && error.code === 'PGRST116') {
        const newProfile = {
            id: user.id,
            ...authData,
            updated_at: new Date().toISOString()
        };
        // Fire and forget upsert
        await supabase.from('profiles').upsert(newProfile);
        return NextResponse.json(newProfile);
    }

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if we need to sync/fill missing fields
    let needsUpdate = false;
    const updates: any = { id: user.id };

    if (!data.full_name && authData.full_name) {
        data.full_name = authData.full_name;
        updates.full_name = authData.full_name;
        needsUpdate = true;
    }

    if (!data.avatar_url && authData.avatar_url) {
        data.avatar_url = authData.avatar_url;
        updates.avatar_url = authData.avatar_url;
        needsUpdate = true;
    }

    // If we filled in missing data, save it to DB
    if (needsUpdate) {
        supabase.from('profiles').upsert(updates).then(({ error }) => {
            if (error) console.error("Auto-sync profile failed:", error);
        });
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
