"use client"

import * as React from "react"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Transaction } from "@/lib/types"
import { TransactionItem } from "./TransactionItem"
import { EditTransactionDialog } from "./EditTransactionDialog"
import { MonthNavigator } from "./MonthNavigator"
import { useLanguage } from "@/lib/i18n/language-context"

interface TransactionListProps {
    transactions: Transaction[]
    isLoading: boolean
    onUpdate: () => void
    currentMonth: Date
    onMonthChange: (date: Date) => void
    availableMonths: string[]
}

export function TransactionList({ transactions, isLoading, onUpdate, currentMonth, onMonthChange, availableMonths }: TransactionListProps) {
    const { t, locale } = useLanguage()
    const router = useRouter()
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => { setIsMounted(true) }, [])

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

    // Filter transactions for selected month
    const filteredTransactions = React.useMemo(() => {
        const selectedKey = format(currentMonth, "yyyy-MM")
        return transactions.filter(t => {
            const date = new Date(t.date)
            if (isNaN(date.getTime())) return false
            return format(date, "yyyy-MM") === selectedKey
        })
    }, [transactions, currentMonth])

    // Calculate monthly totals
    const monthlyTotals = React.useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)
        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)
        return { income, expenses, balance: income - expenses }
    }, [filteredTransactions])

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setIsEditDialogOpen(true)
    }

    if (isLoading) {
        return <div>{t.dashboard.loading}</div>
    }

    if (!isMounted) return null

    if (transactions.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                {t.dashboard.noTransactions}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Month Navigator */}
            <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                <MonthNavigator
                    currentMonth={currentMonth}
                    onMonthChange={onMonthChange}
                    availableMonths={availableMonths}
                />

                {/* Monthly Summary */}
                <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-border/30 text-sm">
                    <div className="text-center">
                        <span className="text-muted-foreground">
                            {locale === 'pt' ? 'Receitas' : 'Income'}
                        </span>
                        <p className="font-semibold text-green-500">
                            +{formatCurrency(monthlyTotals.income)}
                        </p>
                    </div>
                    <div className="text-center">
                        <span className="text-muted-foreground">
                            {locale === 'pt' ? 'Despesas' : 'Expenses'}
                        </span>
                        <p className="font-semibold text-red-500">
                            -{formatCurrency(monthlyTotals.expenses)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground border-2 border-dashed rounded-xl">
                    {locale === 'pt' ? 'Nenhuma transação neste mês' : 'No transactions this month'}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((t) => (
                        <TransactionItem
                            key={t.id}
                            transaction={t}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            <EditTransactionDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                transaction={editingTransaction}
                onSuccess={onUpdate}
            />
        </div>
    )
}

