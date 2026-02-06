"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { ShoppingBag, ArrowRight, BrainCircuit } from "lucide-react"

interface ImpulseSimulatorProps {
    transactions: Transaction[]
    currentBalance: number
}

export function ImpulseSimulator({ transactions, currentBalance }: ImpulseSimulatorProps) {
    const [amount, setAmount] = React.useState("")

    // Copy burn rate logic (could extract to hook later)
    const calculateBurnRate = () => {
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)

        const recentExpenses = transactions.filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'expense' && tDate >= thirtyDaysAgo
        })

        const totalSpent = recentExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
        if (totalSpent === 0) return 0
        return totalSpent / 30
    }

    const burnRate = calculateBurnRate()
    const purchaseAmount = parseFloat(amount) || 0

    const costInDays = burnRate > 0 ? Math.round(purchaseAmount / burnRate) : 0

    // Opportunity cost examples (randomized or static)
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
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                        <Input
                            type="number"
                            placeholder="0,00"
                            className="pl-9"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                {purchaseAmount > 0 && (
                    <div className="rounded-lg bg-background/50 border p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mt-1">
                                <TrendingDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    -{costInDays} dias de vida
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    {getOpportunityCost(purchaseAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {purchaseAmount === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-2 opacity-50">
                        Veja o impacto real antes de gastar.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function TrendingDownIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    )
}
