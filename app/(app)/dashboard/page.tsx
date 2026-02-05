"use client"

import { TransactionList } from "@/components/transactions/TransactionList"
import { useLanguage } from "@/lib/i18n/language-context"

import * as React from "react"
import { DashboardSummary } from "@/components/dashboard/DashboardSummary"
import { FinancialChart } from "@/components/dashboard/FinancialChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { InstallmentWidget } from "@/components/dashboard/InstallmentWidget"
import { Transaction } from "@/lib/types"

export default function DashboardPage() {
    const { t } = useLanguage()
    const [transactions, setTransactions] = React.useState<Transaction[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchTransactions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/transactions")
            if (res.ok) {
                const data = await res.json()
                setTransactions(data)
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchTransactions()
    }, [])

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const total = income - expenses

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
                    <p className="text-sm text-muted-foreground">{t.dashboard.overview}</p>
                </div>
            </div>

            <DashboardSummary income={income} expenses={expenses} total={total} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Main Column (Charts & Transactions) */}
                <div className="lg:col-span-2 space-y-6">
                    <FinancialChart transactions={transactions} />

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">{t.dashboard.recentTransactions}</h2>
                            <TransactionList
                                transactions={transactions}
                                isLoading={isLoading}
                                onUpdate={fetchTransactions}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (Widgets) */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    <InstallmentWidget transactions={transactions} />
                    <CategoryChart transactions={transactions} />
                </div>
            </div>
        </div>
    )
}
