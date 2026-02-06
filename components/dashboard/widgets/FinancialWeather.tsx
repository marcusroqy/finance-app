"use client"

import { Card } from "@/components/ui/card"
import { Cloud, CloudLightning, CloudRain, Sun } from "lucide-react"

interface FinancialWeatherProps {
    income: number
    expenses: number
    balance: number
}

export function FinancialWeather({ income, expenses, balance }: FinancialWeatherProps) {
    const getWeatherData = () => {
        // Avoid division by zero
        if (income === 0 && expenses === 0) return {
            icon: Sun,
            color: "text-yellow-500",
            title: "Céu Limpo",
            description: "Sem movimentações ainda."
        }

        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : -100

        // 1. Storm: Huge deficit or big loss
        if (balance < -(income * 0.1)) {
            return {
                icon: CloudLightning,
                color: "text-purple-600 dark:text-purple-400",
                bg: "from-purple-500/10 to-purple-900/10",
                title: "Tempestade",
                description: "Gastos excedendo muito a renda. Cuidado!"
            }
        }

        // 2. Rain: Small deficit
        if (balance < 0) {
            return {
                icon: CloudRain,
                color: "text-blue-600 dark:text-blue-400",
                bg: "from-blue-500/10 to-blue-900/10",
                title: "Chuva Passageira",
                description: "Fechando levemente no negativo."
            }
        }

        // 3. Cloudy: Positive but tight (< 20% savings)
        if (savingsRate < 20) {
            return {
                icon: Cloud,
                color: "text-gray-500",
                bg: "from-gray-500/10 to-gray-900/10",
                title: "Nublado",
                description: "No azul, mas pouca margem de manobra."
            }
        }

        // 4. Sunny: Good savings (> 20%)
        return {
            icon: Sun,
            color: "text-yellow-500",
            bg: "from-yellow-500/10 to-orange-500/10",
            title: "Ensolarado",
            description: "Ótima saúde financeira! Continue assim."
        }
    }

    const weather = getWeatherData()
    const Icon = weather.icon

    return (
        <Card className={`border-none shadow-none bg-transparent`}>
            <div className={`p-4 rounded-xl border flex items-center gap-4 bg-gradient-to-r ${weather.bg}`}>
                <div className={`p-3 rounded-full bg-background/50 backdrop-blur ${weather.color}`}>
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{weather.title}</h3>
                    <p className="text-sm text-muted-foreground">{weather.description}</p>
                </div>
            </div>
        </Card>
    )
}
