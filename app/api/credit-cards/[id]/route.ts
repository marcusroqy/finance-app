
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
