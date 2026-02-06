
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params are now Promises in Next.js 15+ (and 14 in some configs, safer to await)
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params;

        const { error } = await supabase
            .from('credit_cards')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Security: ensure user owns the card

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params;
        const body = await request.json()

        const { data, error } = await supabase
            .from('credit_cards')
            .update({
                name: body.name,
                last_4_digits: body.last_4_digits,
                brand: body.brand,
                color: body.color
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
