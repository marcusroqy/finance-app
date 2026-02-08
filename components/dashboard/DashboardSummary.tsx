"use client"

import { formatCurrency } from "@/lib/utils"

import { useLanguage } from "@/lib/i18n/language-context"
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react"

interface DashboardSummaryProps {
    income: number
    expenses: number
    total: number
}

export function DashboardSummary({ income, expenses, total }: DashboardSummaryProps) {
    const { t } = useLanguage()

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.dashboard.totalBalance}</h3>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold pt-2">
                    {formatCurrency(total)}
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-emerald-500">{t.dashboard.income}</h3>
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold pt-2 text-emerald-500">
                    +{formatCurrency(income)}
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-rose-500">{t.dashboard.expenses}</h3>
                    <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold pt-2 text-rose-500">
                    -{formatCurrency(expenses)}
                </div>
            </div>
        </div>
    )
}
