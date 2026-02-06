"use client"

import { TransactionList } from "@/components/transactions/TransactionList"
import { useLanguage } from "@/lib/i18n/language-context"

import * as React from "react"
import { DashboardSummary } from "@/components/dashboard/DashboardSummary"
import { FinancialChart } from "@/components/dashboard/FinancialChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { InstallmentWidget } from "@/components/dashboard/InstallmentWidget"
import { Transaction } from "@/lib/types"
import { CreditCardsWidget } from "@/components/dashboard/CreditCardsWidget"

import { SurvivalTimeline } from "@/components/dashboard/widgets/SurvivalTimeline"
import { ImpulseSimulator } from "@/components/dashboard/widgets/ImpulseSimulator"
import { FinancialWeather } from "@/components/dashboard/widgets/FinancialWeather"

export default function DashboardPage() {
    const { t } = useLanguage()
    const [transactions, setTransactions] = React.useState<Transaction[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchTransactions = async () => {
        // ... functionality remains same ...
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
                    <p className="text-sm text-muted-foreground">{t.dashboard.overview}</p>
                </div>
                <div>
                    <FinancialWeather income={income} expenses={expenses} balance={total} />
                </div>
            </div>

            <DashboardSummary income={income} expenses={expenses} total={total} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Main Column (Charts & Transactions) */}
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                    <CreditCardsWidget transactions={transactions} onUpdate={fetchTransactions} />
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
                <div className="space-y-6 lg:sticky lg:top-6 order-1 lg:order-2">
                    <SurvivalTimeline transactions={transactions} currentBalance={total} />
                    <ImpulseSimulator transactions={transactions} currentBalance={total} />
                    <InstallmentWidget transactions={transactions} />
                    <CategoryChart transactions={transactions} />
                </div>
            </div>
        </div>
    )
}
