"use client"

import * as React from "react"
import { format } from "date-fns"
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
    onUpdate: () => void // Callback to refresh parent state
}

export function TransactionList({ transactions, isLoading, onUpdate }: TransactionListProps) {
    const { t, locale } = useLanguage()
    const router = useRouter()

    // State for selected month (defaults to current month)
    const [selectedMonth, setSelectedMonth] = React.useState(() => new Date())

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

    // Get available months from transactions
    const availableMonths = React.useMemo(() => {
        const months = new Set<string>()
        transactions.forEach(t => {
            const date = new Date(t.date)
            months.add(format(date, "yyyy-MM"))
        })
        return Array.from(months).sort((a, b) => b.localeCompare(a))
    }, [transactions])

    // Auto-select the most recent month with transactions
    React.useEffect(() => {
        if (availableMonths.length > 0) {
            const currentMonthKey = format(selectedMonth, "yyyy-MM")
            if (!availableMonths.includes(currentMonthKey)) {
                // Select the most recent month with transactions
                const [year, month] = availableMonths[0].split("-")
                setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1))
            }
        }
    }, [availableMonths])

    // Filter transactions for selected month
    const filteredTransactions = React.useMemo(() => {
        const selectedKey = format(selectedMonth, "yyyy-MM")
        return transactions.filter(t => {
            const date = new Date(t.date)
            return format(date, "yyyy-MM") === selectedKey
        })
    }, [transactions, selectedMonth])

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
                    currentMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    availableMonths={availableMonths}
                />

                {/* Monthly Summary */}
                <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-border/30 text-sm">
                    <div className="text-center">
                        <span className="text-muted-foreground">
                            {locale === 'pt' ? 'Receitas' : 'Income'}
                        </span>
                        <p className="font-semibold text-green-500">
                            +{locale === 'pt' ? 'R$' : '$'}{monthlyTotals.income.toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center">
                        <span className="text-muted-foreground">
                            {locale === 'pt' ? 'Despesas' : 'Expenses'}
                        </span>
                        <p className="font-semibold text-red-500">
                            -{locale === 'pt' ? 'R$' : '$'}{monthlyTotals.expenses.toFixed(2)}
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

