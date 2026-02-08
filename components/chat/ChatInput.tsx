"use client"

import * as React from "react"
import { Send, Paperclip, X, Image as ImageIcon } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface ChatInputProps {
    onSend: (message: string, image?: string) => void
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const { t } = useLanguage()
    const [input, setInput] = React.useState("")
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if ((input.trim() || selectedImage) && !disabled) {
            onSend(input, selectedImage || undefined)
            setInput("")
            setSelectedImage(null)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as any)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    return (
        <form onSubmit={handleSubmit} className="relative group w-full max-w-3xl mx-auto">
            {/* Image Preview */}
            {selectedImage && (
                <div className="absolute bottom-full mb-2 left-0 z-20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="relative group/preview inline-block">
                        <img
                            src={selectedImage}
                            alt="Selected"
                            className="h-20 w-auto rounded-xl border border-border shadow-sm object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-1 -right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            <div className="relative flex items-end transition-all duration-300 bg-transparent backdrop-blur-sm rounded-2xl border border-zinc-600/50 shadow-sm focus-within:shadow-md focus-within:border-zinc-500">

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {/* Attachment Button */}
                <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={disabled}
                    className="p-3 mb-1 ml-1 text-zinc-400 hover:text-primary transition-colors disabled:opacity-50"
                    title="Anexar imagem"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedImage ? "Fale sobre essa imagem..." : t.chat.inputPlaceholder}
                    disabled={disabled}
                    rows={1}
                    className="w-full p-3.5 bg-transparent border-none outline-none resize-none max-h-32 text-base text-zinc-100 placeholder:text-zinc-400 min-h-[52px] leading-relaxed"
                />

                <button
                    type="submit"
                    disabled={disabled || (!input.trim() && !selectedImage)}
                    className="m-2 p-2.5 rounded-xl bg-primary text-primary-foreground opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:scale-90 disabled:pointer-events-none transition-all duration-200 shadow-sm self-end"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            {/* Helper Text */}
            <p className="hidden md:block absolute -bottom-8 left-0 right-0 text-center text-[10px] text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 delay-150">
                {t.chat.footer}
            </p>
        </form>
    )
}
