"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Transaction } from "@/lib/types"
import { TransactionItem } from "./TransactionItem"
import { EditTransactionDialog } from "./EditTransactionDialog"
import { useLanguage } from "@/lib/i18n/language-context"

interface TransactionListProps {
    transactions: Transaction[]
    isLoading: boolean
    onUpdate: () => void // Callback to refresh parent state
}

export function TransactionList({ transactions, isLoading, onUpdate }: TransactionListProps) {
    const { t, locale } = useLanguage()
    const router = useRouter()

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success(t.transactions.successfullyDeleted)
            onUpdate() // Refresh parent
        } catch (error) {
            toast.error(t.transactions.deleteError)
        }
    }

    const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

    // Group by Month (Moves before conditional returns to fix Hook Error)
    const groupedTransactions = React.useMemo(() => {
        const groups: Record<string, Transaction[]> = {}
        transactions.forEach(t => {
            const date = new Date(t.date)
            const key = format(date, "yyyy-MM") // Sortable key
            if (!groups[key]) groups[key] = []
            groups[key].push(t)
        })
        return groups
    }, [transactions])

    // Sort keys descending (newest first)
    // Memoize this too to keep hooks order consistent if we wanted, but logic is fine here.
    const sortedKeys = React.useMemo(() =>
        Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)),
        [groupedTransactions])


    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setIsEditDialogOpen(true)
    }

    if (isLoading) {
        return <div>{t.dashboard.loading}</div>
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                {t.dashboard.noTransactions}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {sortedKeys.map(key => {
                const groupDate = new Date(key + "-01");
                const isPt = locale === 'pt';

                // Format title securely using imported locale
                const monthTitle = format(groupDate, "MMMM yyyy", {
                    locale: isPt ? ptBR : undefined
                });

                // Capitalize first letter
                const finalTitle = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);

                return (
                    <div key={key} className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground bg-muted/30 p-2 px-4 rounded-lg inline-block border border-border/50">
                            {finalTitle}
                        </h3>
                        {groupedTransactions[key].map((t) => (
                            <TransactionItem
                                key={t.id}
                                transaction={t}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )
            })}

            <EditTransactionDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                transaction={editingTransaction}
                onSuccess={onUpdate}
            />
        </div>
    )
}
