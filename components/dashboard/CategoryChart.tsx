"use client"

import * as React from "react"
import { useLanguage } from "@/lib/i18n/language-context"
import { Transaction } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CategoryChartProps {
    transactions: Transaction[]
}

const COLORS = {
    Food: '#F97316',        // Orange
    Transport: '#3B82F6',   // Blue
    Utilities: '#EAB308',   // Yellow
    Shopping: '#A855F7',    // Purple
    Entertainment: '#EC4899', // Pink
    Health: '#EF4444',      // Red
    Salary: '#10B981',      // Emerald
    General: '#71717A'      // Zinc
};

export function CategoryChart({ transactions }: CategoryChartProps) {
    const { t } = useLanguage()
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    const data = React.useMemo(() => {
        if (!isMounted) return []
        const categories: Record<string, number> = {}
        let total = 0;

        transactions.forEach(t => {
            if (t.type === 'expense') { // Only expenses for category breakdown usually
                const amount = Number(t.amount)
                if (!isNaN(amount) && amount > 0) {
                    if (!categories[t.category]) categories[t.category] = 0
                    categories[t.category] += amount
                    total += amount
                }
            }
        })

        if (total === 0) return []

        return Object.entries(categories)
            .map(([name, value]) => ({
                name: t.categories[name as keyof typeof t.categories] || name,
                key: name,
                value,
                percentage: (value / total) * 100
            }))
            .sort((a, b) => b.value - a.value)
            .filter(i => i.percentage > 1) // Hide tiny slices
    }, [transactions, t, isMounted])

    if (!isMounted) {
        return <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col h-[300px] items-center justify-center text-muted-foreground">Carregando categorias...</div>
    }

    if (data.length === 0) return null

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground mb-4">Gastos por Categoria</h3>
            <div className="h-[300px] w-full mt-auto min-w-[1px]">
                <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS] || COLORS.General} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
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
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
