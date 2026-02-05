"use client"

import * as React from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface ChatInputProps {
    onSend: (message: string) => void
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const { t } = useLanguage()
    const [input, setInput] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim() && !disabled) {
            onSend(input)
            setInput("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as any)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative group w-full max-w-3xl mx-auto">
            <div className="relative flex items-center transition-all duration-300">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.chat.inputPlaceholder}
                    disabled={disabled}
                    className="w-full p-4 pr-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] focus:shadow-[0_4px_16px_rgba(0,0,0,0.08)] ml-0 focus:scale-[1.01] transition-all duration-300 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-base"
                />
                <button
                    type="submit"
                    disabled={disabled || !input.trim()}
                    className="absolute right-2 p-2.5 rounded-xl bg-primary text-primary-foreground opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:scale-90 disabled:pointer-events-none transition-all duration-200 shadow-sm"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
            {/* Helper Text - Fade in on hover/focus */}
            <p className="absolute -bottom-8 left-0 right-0 text-center text-[10px] text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 delay-150">
                {t.chat.footer}
            </p>
        </form>
    )
}
