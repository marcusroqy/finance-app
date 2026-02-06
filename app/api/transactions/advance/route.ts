
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid IDs provided' }, { status: 400 })
        }

        const now = new Date().toISOString();

        // Update the transactions to set their date to now (or yesterday to be safe from timezone issues?)
        // Setting to now makes them "current"

        // We might also want to change status if we had one, but we rely on date.
        // So just updating date is enough for the Widget to see them as "paid" (or current)

        const { data, error } = await supabase
            .from('transactions')
            .update({ date: now })
            .in('id', ids)
            .select()

        if (error) {
            console.error('Error advancing installments:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: data.length })

    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
