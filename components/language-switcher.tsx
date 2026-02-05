"use client"

import * as React from "react"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

export function LanguageSelector({ className }: { className?: string }) {
    const { locale, setLocale } = useLanguage()

    return (
        <div className={cn("flex items-center gap-2 text-xs font-medium", className)}>
            <button
                onClick={() => setLocale('en')}
                className={cn(
                    "hover:text-foreground transition-colors",
                    locale === 'en' ? "text-foreground" : "text-muted-foreground"
                )}
            >
                EN
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button
                onClick={() => setLocale('pt')}
                className={cn(
                    "hover:text-foreground transition-colors",
                    locale === 'pt' ? "text-foreground" : "text-muted-foreground"
                )}
            >
                PT
            </button>
        </div>
    )
}
