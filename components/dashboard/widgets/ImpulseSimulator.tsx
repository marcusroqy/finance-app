"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { BrainCircuit, Briefcase, TrendingDown, Info } from "lucide-react"

interface ImpulseSimulatorProps {
    transactions: Transaction[]
    currentBalance: number
}

export function ImpulseSimulator({ transactions, currentBalance }: ImpulseSimulatorProps) {
    const [displayValue, setDisplayValue] = React.useState("")
    const [rawValue, setRawValue] = React.useState(0)

    // Handle currency input formatting
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "")
        const numberValue = Number(value) / 100

        setRawValue(numberValue)

        if (value === "") {
            setDisplayValue("")
            return
        }

        setDisplayValue(new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numberValue))
    }

    // 1. Calculate Burn Rate (Expenses / 30 days)
    const calculateMetrics = () => {
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)

        // Expenses
        const recentExpenses = transactions.filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'expense' && tDate >= thirtyDaysAgo
        })
        const totalSpent = recentExpenses.reduce((sum, t) => {
            const val = Number(t.amount)
            return sum + (isNaN(val) ? 0 : val)
        }, 0)
        const dailyBurnRate = totalSpent > 0 ? totalSpent / 30 : 0

        // Income
        const recentIncome = transactions.filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'income' && tDate >= thirtyDaysAgo
        })
        const totalIncome = recentIncome.reduce((sum, t) => {
            const val = Number(t.amount)
            return sum + (isNaN(val) ? 0 : val)
        }, 0)
        const dailyIncome = totalIncome > 0 ? totalIncome / 30 : 0 // Income per calendar day

        // Work days (assuming 22 work days/mo standard for simpler mental model, or 30 for daily avg)
        // Let's use daily avg income to be consistent

        return { dailyBurnRate, dailyIncome }
    }

    const { dailyBurnRate, dailyIncome } = calculateMetrics()

    // Visual calculations
    const costInSurvivalDays = dailyBurnRate > 0 ? (rawValue / dailyBurnRate).toFixed(1) : "0"
    const costInWorkDays = dailyIncome > 0 ? (rawValue / dailyIncome).toFixed(1) : "?"

    // Opportunity cost examples
    const getOpportunityCost = (val: number) => {
        if (val < 50) return "Isso é quase 2 assinaturas de streaming."
        if (val < 150) return "Daria para pedir 3 jantares fora."
        if (val < 500) return "Você poderia comprar 4 cotas de FIIs."
        if (val < 2000) return "Isso pagaria uma passagem aérea nacional."
        return "Esse valor renderia aprox. " + formatCurrency(val * 0.01) + " por mês investido."
    }

    return (
        <Card className="border-indigo-100 dark:border-indigo-950/50 bg-gradient-to-br from-white to-indigo-50/20 dark:from-background dark:to-indigo-950/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-indigo-500" />
                    Simulador de Impulso
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Quer comprar algo? Digite o valor:</label>
                    <div className="relative">
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            value={displayValue}
                            onChange={handleInputChange}
                            className="font-mono"
                        />
                    </div>
                </div>

                {rawValue > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">

                        {/* Survival Cost */}
                        <div className="rounded-lg bg-background/50 border p-3 flex items-start gap-3">
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mt-1">
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    -{costInSurvivalDays} dias de vida
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Baseado no seu custo de vida mensal (Gasto).
                                </p>
                            </div>
                        </div>

                        {/* Work Cost (New) */}
                        <div className="rounded-lg bg-background/50 border p-3 flex items-start gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mt-1">
                                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {costInWorkDays} dias de trabalho
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    O tempo que você levou para ganhar esse dinheiro (Renda).
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground italic pl-1 border-l-2 border-indigo-200 pl-2">
                            💡 {getOpportunityCost(rawValue)}
                        </p>
                    </div>
                )}

                {rawValue === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-2 opacity-50">
                        Veja o impacto real (Tempo x Dinheiro) antes de gastar.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
