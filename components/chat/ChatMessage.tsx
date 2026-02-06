import { cn } from "@/lib/utils"
// import { BeatLoader } from "react-spinners" // If I had it, but I'll likely just use text for now


export interface MessageOption {
    label: string
    value: string
    action?: string
}

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    image?: string // Base64 or URL
    createdAt: Date
    options?: MessageOption[]
}

interface ChatMessageProps {
    message: Message
    onOptionClick?: (option: MessageOption) => void
}

import { useLanguage } from "@/lib/i18n/language-context"
import { Sparkles, User, ChevronRight } from "lucide-react"

export function ChatMessage({ message, onOptionClick }: ChatMessageProps) {
    const { t } = useLanguage()
    const isUser = message.role === "user"

    return (
        <div className={cn("flex gap-3 w-full max-w-3xl mx-auto mb-6 opacity-0", isUser ? "flex-row-reverse animate-message-in-right" : "flex-row animate-message-in-left")}>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ring-1 ring-inset transition-all duration-300", isUser ? "bg-primary text-primary-foreground ring-primary/10" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ring-zinc-200 dark:ring-zinc-800")}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />}
            </div>
            <div className={cn("flex flex-col max-w-[85%] md:max-w-[75%]", isUser ? "items-end" : "items-start")}>
                <div className={cn("text-[11px] font-semibold mb-1.5 opacity-40 uppercase tracking-widest flex items-center gap-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
                    {isUser ? "Você" : "Nova ✨"}
                </div>
                <div
                    className={cn(
                        "text-[15px] leading-relaxed px-4 py-3 shadow-sm",
                        isUser
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-primary/10"
                            : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm shadow-sm"
                    )}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Options/Buttons */}
                {message.options && message.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-150">
                        {message.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => onOptionClick?.(option)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
                            >
                                {option.label}
                                <ChevronRight className="w-3 h-3 opacity-50" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
