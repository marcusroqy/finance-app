"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Clock, TrendingDown, AlertTriangle } from "lucide-react"

interface SurvivalTimelineProps {
    transactions: Transaction[]
    currentBalance: number
}

export function SurvivalTimeline({ transactions, currentBalance }: SurvivalTimelineProps) {
    // 1. Calculate Average Daily Spend (past 30 days)
    const calculateBurnRate = () => {
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)

        const recentExpenses = transactions.filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'expense' && tDate >= thirtyDaysAgo
        })

        const totalSpent = recentExpenses.reduce((sum, t) => sum + Number(t.amount), 0)

        // Prevent division by zero if no expenses
        if (totalSpent === 0) return 0

        // Simple average: Total / 30
        return totalSpent / 30
    }

    const burnRate = calculateBurnRate()
    const daysLeft = burnRate > 0 ? Math.floor(currentBalance / burnRate) : 999

    // Capping days for visual progress bar (e.g. max 90 days 'safe')
    const maxSafeDays = 60
    const survivalProgress = Math.min((daysLeft / maxSafeDays) * 100, 100)

    const getStatusColor = () => {
        if (daysLeft < 10) return "text-red-500"
        if (daysLeft < 30) return "text-yellow-500"
        return "text-green-500"
    }

    const getProgressBarColor = () => {
        if (daysLeft < 10) return "bg-red-500"
        if (daysLeft < 30) return "bg-yellow-500"
        return "bg-green-500"
    }

    if (currentBalance <= 0) {
        return (
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        Modo Sobrevivência
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">Saldo Negativo</p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                        Atenção máxima aos gastos necessária.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Tempo de Vida Financeiro
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                        Burn Rate: {formatCurrency(burnRate)}/dia
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${getStatusColor()}`}>
                            {daysLeft}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">dias</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Se mantiver o ritmo atual, seu saldo acaba em {daysLeft} dias.
                    </p>
                </div>

                <div className="space-y-1">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
                            style={{ width: `${survivalProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Perigo (0d)</span>
                        <span>Conforto ({maxSafeDays}d+)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
