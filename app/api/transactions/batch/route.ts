
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    const supabase = await createClient()
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function PUT(request: Request) {
    const supabase = await createClient()
    const { ids, updates } = await request.json()

    if (!ids || !Array.isArray(ids) || !updates) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { error } = await supabase
        .from('transactions')
        .update(updates)
        .in('id', ids)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
