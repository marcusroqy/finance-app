import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ids, updates } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
    }

    // 🔒 SECURITY: First verify ALL transactions belong to this user
    const { data: userTransactions, error: verifyError } = await supabase
        .from('transactions')
        .select('id')
        .in('id', ids)
        .eq('user_id', user.id)

    if (verifyError) {
        return NextResponse.json({ error: 'Failed to verify ownership' }, { status: 500 })
    }

    // Check if all requested IDs belong to user
    const ownedIds = userTransactions?.map(t => t.id) || []
    const unauthorizedIds = ids.filter((id: string) => !ownedIds.includes(id))

    if (unauthorizedIds.length > 0) {
        console.warn(`[SECURITY] User ${user.id} attempted to modify transactions they don't own: ${unauthorizedIds}`)
        return NextResponse.json({ error: 'Access denied to one or more transactions' }, { status: 403 })
    }

    // 1. If description is being updated, handle (1/N) preservation
    if (updates.description) {
        const { data: currentTransactions } = await supabase
            .from('transactions')
            .select('id, description')
            .in('id', ids)
            .eq('user_id', user.id) // Extra safety

        if (currentTransactions) {
            const promises = currentTransactions.map(t => {
                // Extract (1/N) part
                const match = t.description.match(/\s*\(\d+\/\d+\)/);
                const suffix = match ? match[0] : '';

                // New Description = NewName + Suffix
                const newDesc = `${updates.description}${suffix}`;

                // Prepare the update object
                const finalUpdates = { ...updates, description: newDesc };

                // Remove amount if it's not a valid number
                if (updates.amount !== undefined && updates.amount !== null) {
                    finalUpdates.amount = parseFloat(updates.amount)
                }

                return supabase
                    .from('transactions')
                    .update(finalUpdates)
                    .eq('id', t.id)
                    .eq('user_id', user.id) // Extra safety
            });

            await Promise.all(promises);
            return NextResponse.json({ success: true })
        }
    }

    // 2. Batch update for Category/Brand only
    const safeUpdates = { ...updates }
    if (safeUpdates.amount !== undefined && safeUpdates.amount !== null) {
        safeUpdates.amount = parseFloat(safeUpdates.amount)
    }

    const { data, error } = await supabase
        .from('transactions')
        .update(safeUpdates)
        .in('id', ids)
        .eq('user_id', user.id) // 🔒 Only update user's own transactions
        .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
