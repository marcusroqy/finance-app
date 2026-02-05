"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface MonthNavigatorProps {
    currentMonth: Date
    onMonthChange: (date: Date) => void
    availableMonths?: string[] // Format: "yyyy-MM"
    className?: string
}

export function MonthNavigator({
    currentMonth,
    onMonthChange,
    availableMonths,
    className
}: MonthNavigatorProps) {
    const { locale } = useLanguage()
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [touchStart, setTouchStart] = React.useState<number | null>(null)

    const isPt = locale === 'pt'
    const monthKey = format(currentMonth, "yyyy-MM")

    // Format month name with locale
    const monthName = format(currentMonth, "MMMM yyyy", {
        locale: isPt ? ptBR : undefined
    })
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

    // Check if can navigate
    const canGoPrev = !availableMonths || availableMonths.includes(format(subMonths(currentMonth, 1), "yyyy-MM"))
    const canGoNext = !availableMonths || availableMonths.includes(format(addMonths(currentMonth, 1), "yyyy-MM"))

    const handlePrev = () => {
        if (canGoPrev) {
            onMonthChange(subMonths(currentMonth, 1))
        }
    }

    const handleNext = () => {
        if (canGoNext) {
            onMonthChange(addMonths(currentMonth, 1))
        }
    }

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return

        const touchEnd = e.changedTouches[0].clientX
        const diff = touchStart - touchEnd

        // Swipe threshold of 50px
        if (Math.abs(diff) > 50) {
            if (diff > 0 && canGoNext) {
                // Swipe left = next month
                handleNext()
            } else if (diff < 0 && canGoPrev) {
                // Swipe right = prev month
                handlePrev()
            }
        }
        setTouchStart(null)
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex items-center justify-between gap-2 select-none",
                className
            )}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="h-9 w-9 shrink-0 rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-30 transition-all"
                aria-label={isPt ? "Mês anterior" : "Previous month"}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 text-center">
                <span className="text-base font-semibold text-foreground tracking-tight">
                    {capitalizedMonth}
                </span>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={!canGoNext}
                className="h-9 w-9 shrink-0 rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-30 transition-all"
                aria-label={isPt ? "Próximo mês" : "Next month"}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    )
}
