"use client"

import { useLanguage } from "@/lib/i18n/language-context"
import { Transaction } from "@/lib/types"
import { format, subDays } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface FinancialChartProps {
    transactions: Transaction[]
}

export function FinancialChart({ transactions }: FinancialChartProps) {
    const { t, locale } = useLanguage()

    // Process data: Group by last 7 days
    const data = React.useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i)
            return {
                date: date,
                label: format(date, "dd/MM"),
                income: 0,
                expense: 0
            }
        })

        transactions.forEach(transaction => {
            const tDate = new Date(transaction.date)
            const dayData = last7Days.find(d =>
                d.date.getDate() === tDate.getDate() &&
                d.date.getMonth() === tDate.getMonth() &&
                d.date.getFullYear() === tDate.getFullYear()
            )

            if (dayData) {
                if (transaction.type === 'income') {
                    dayData.income += Number(transaction.amount)
                } else {
                    dayData.expense += Number(transaction.amount)
                }
            }
        })

        return last7Days
    }, [transactions])

    if (transactions.length === 0) return null

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground mb-6">{t.dashboard.chartTitle}</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis
                            dataKey="label"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                                color: 'var(--card-foreground)',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{
                                color: 'var(--card-foreground)'
                            }}
                            cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                        />
                        <Bar
                            dataKey="income"
                            name={t.transactions.income}
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="expense"
                            name={t.transactions.expense}
                            fill="#f43f5e"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

import * as React from "react"
