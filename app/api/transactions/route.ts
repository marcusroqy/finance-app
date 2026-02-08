import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateTransactionDTO } from '@/lib/types'

// Setup types locally if not exported fully or just use logic
interface ExtendedDTO extends CreateTransactionDTO {
    brand?: string;
    brandLogo?: string;
    installments?: number;
    cardId?: string;
    isRecurring?: boolean;
    recurringDay?: number;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json() as ExtendedDTO

        // Determine status based on date (Future = Pending)
        const isFuture = new Date(body.date) > new Date();
        const status = isFuture ? 'pending' : 'paid';

        // Basic validation could go here, or use Zod

        if (body.installments && body.installments > 1) {
            const transactions = [];
            const baseDate = new Date(body.date);

            // Clean description if it already has (1/N) to avoid duplication
            let baseDescription = body.description.replace(/\s*\(\d+\/\d+\)/, '').trim();

            for (let i = 0; i < body.installments; i++) {
                const newDate = new Date(baseDate);
                newDate.setMonth(baseDate.getMonth() + i);

                // Future installments are always pending if distinct from today
                const installmentStatus = newDate > new Date() ? 'pending' : 'paid';

                transactions.push({
                    user_id: user.id,
                    type: body.type,
                    amount: body.amount,
                    category: body.category,
                    description: `${baseDescription} (${i + 1}/${body.installments})`,
                    date: newDate.toISOString(),
                    brand: body.brand,
                    brand_logo_url: body.brandLogo,
                    card_id: body.cardId,
                    created_at: new Date().toISOString(),
                    status: installmentStatus
                });
            }

            const { data, error } = await supabase
                .from('transactions')
                .insert(transactions)
                .select();

            if (error) {
                console.error('Error inserting installments:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            return NextResponse.json(data);
        } else {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    type: body.type,
                    amount: body.amount,
                    category: body.category,
                    description: body.description,
                    date: body.date,
                    brand: body.brand,
                    brand_logo_url: body.brandLogo,
                    card_id: body.cardId,
                    is_recurring: body.isRecurring,
                    recurring_day: body.recurringDay,
                    status: status
                })
                .select()
                .single()

            if (error) {
                console.error('Error inserting transaction:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            return NextResponse.json(data)
        }
    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100) // Increase limit to catch more installments history

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Smart Categorization on Read (Hotfix for old data)
    // If category is General, try to infer again based on updated dictionary
    // We duplicate the simple dictionary logic here or import it if compatible (importing parser might be heavy if it has dependencies not friendly to edge, but here is Node env so ok)
    // To be safe and fast, let's just do a quick pass map.

    // We can rely on the frontend to do this if we want, but doing it here ensures consistency.
    // Actually, client-side is better for performance if list is huge, but server is cleaner.
    // Let's do it here.

    // We need the CATEGORIES object. It's in lib/parser.ts.
    // Let's assume we can simple-match description.

    // Quick categories re-map script
    const enrichedData = data.map(t => {
        if ((!t.category || t.category === 'General') && t.description) {
            const desc = t.description.toLowerCase();
            if (desc.includes('uber') || desc.includes('99') || desc.includes('gas') || desc.includes('posto')) t.category = 'Transport';
            else if (desc.includes('ifood') || desc.includes('pizza') || desc.includes('burger') || desc.includes('mcdonalds') || desc.includes('restaurante')) t.category = 'Food';
            else if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('hbo')) t.category = 'Entertainment';
            else if (desc.includes('pharmacy') || desc.includes('farmacia') || desc.includes('droga')) t.category = 'Health';
            else if (desc.includes('macbook') || desc.includes('apple') || desc.includes('samsung') || desc.includes('iphone') || desc.includes('tv') || desc.includes('eletronico') || desc.includes('shopping')) t.category = 'Shopping';
        }
        return t;
    });

    // Project Recurring Transactions
    const projectedTransactions: any[] = [];
    const today = new Date();

    enrichedData.forEach(t => {
        if (t.is_recurring && t.recurring_day) {
            // Project for the next 12 months
            for (let i = 1; i <= 12; i++) {
                const futureDate = new Date(today.getFullYear(), today.getMonth() + i, t.recurring_day);

                // Create a virtual transaction ID to avoid key conflicts, but keep reference
                const virtualId = `virtual-${t.id}-${i}`;

                projectedTransactions.push({
                    ...t,
                    id: virtualId,
                    date: futureDate.toISOString(),
                    status: 'pending', // Future recurring are always pending
                    is_projected: true // Flag to UI if needed
                });
            }
        }
    });

    // Merge real and projected
    const finalData = [...enrichedData, ...projectedTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(finalData)
}
