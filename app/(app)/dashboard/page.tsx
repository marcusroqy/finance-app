"use client"

import * as React from "react"
import { useLanguage } from "@/lib/i18n/language-context"
import { format } from "date-fns"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Transaction } from "@/lib/types"

// Dynamic imports to prevent SSR hydration mismatches (Standard v2.12 behavior)
const TransactionList = dynamic(() => import("@/components/transactions/TransactionList").then(mod => mod.TransactionList), { ssr: false })
const DashboardSummary = dynamic(() => import("@/components/dashboard/DashboardSummary").then(mod => mod.DashboardSummary), { ssr: false })
const FinancialChart = dynamic(() => import("@/components/dashboard/FinancialChart").then(mod => mod.FinancialChart), { ssr: false })
const CategoryChart = dynamic(() => import("@/components/dashboard/CategoryChart").then(mod => mod.CategoryChart), { ssr: false })
const CreditCardsWidget = dynamic(() => import("@/components/dashboard/CreditCardsWidget").then(mod => mod.CreditCardsWidget), { ssr: false })
const InstallmentWidget = dynamic(() => import("@/components/dashboard/InstallmentWidget").then(mod => mod.InstallmentWidget), { ssr: false })
const SurvivalTimeline = dynamic(() => import("@/components/dashboard/widgets/SurvivalTimeline").then(mod => mod.SurvivalTimeline), { ssr: false })
const ImpulseSimulator = dynamic(() => import("@/components/dashboard/widgets/ImpulseSimulator").then(mod => mod.ImpulseSimulator), { ssr: false })
const FinancialWeather = dynamic(() => import("@/components/dashboard/widgets/FinancialWeather").then(mod => mod.FinancialWeather), { ssr: false })

export default function DashboardPage() {
    const { t } = useLanguage()
    const [transactions, setTransactions] = React.useState<Transaction[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedMonth, setSelectedMonth] = React.useState(() => new Date())

    const fetchTransactions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/transactions")
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) setTransactions(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchTransactions()
    }, [])

    // Get available months from transactions
    const availableMonths = React.useMemo(() => {
        const months = new Set<string>()
        transactions.forEach(t => {
            const date = new Date(t.date)
            if (!isNaN(date.getTime())) {
                months.add(format(date, "yyyy-MM"))
            }
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
            if (isNaN(date.getTime())) return false
            return format(date, "yyyy-MM") === selectedKey
        })
    }, [transactions, selectedMonth])

    const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => {
            const val = Number(t.amount);
            return sum + (isNaN(val) ? 0 : val);
        }, 0)

    const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => {
            const val = Number(t.amount);
            return sum + (isNaN(val) ? 0 : val);
        }, 0)

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
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                    <CreditCardsWidget transactions={transactions} onUpdate={fetchTransactions} />
                    <ErrorBoundary>
                        <FinancialChart transactions={filteredTransactions} />
                    </ErrorBoundary>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">{t.dashboard.recentTransactions}</h2>
                            <TransactionList
                                transactions={transactions}
                                isLoading={isLoading}
                                onUpdate={fetchTransactions}
                                currentMonth={selectedMonth}
                                onMonthChange={setSelectedMonth}
                                availableMonths={availableMonths}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6 lg:sticky lg:top-6 order-1 lg:order-2">
                    <SurvivalTimeline transactions={filteredTransactions} currentBalance={total} />
                    <ImpulseSimulator transactions={filteredTransactions} currentBalance={total} />
                    <InstallmentWidget transactions={filteredTransactions} />
                    <CategoryChart transactions={filteredTransactions} />
                </div>
            </div>
        </div>
    )
}
