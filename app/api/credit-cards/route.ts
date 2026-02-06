
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()

        // Validation
        if (!body.name || !body.last_4_digits) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('credit_cards')
            .insert({
                user_id: user.id,
                name: body.name,
                last_4_digits: body.last_4_digits,
                brand: body.brand || 'other',
                color: body.color || '#000000'
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
