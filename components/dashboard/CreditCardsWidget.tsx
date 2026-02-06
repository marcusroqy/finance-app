"use client"

import * as React from "react"
import { CreditCard, Transaction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BANKS } from "@/lib/parser"
import { Loader2, CreditCard as CreditCardIcon, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatCurrency } from "@/lib/utils"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { TransactionList } from "@/components/transactions/TransactionList"

interface CreditCardsWidgetProps {
    transactions: Transaction[]
    onUpdate?: () => void
}

export function CreditCardsWidget({ transactions, onUpdate }: CreditCardsWidgetProps) {
    const { t } = useLanguage()
    const [cards, setCards] = React.useState<CreditCard[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedCard, setSelectedCard] = React.useState<CreditCard | null>(null)

    const fetchCards = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/credit-cards')
            if (res.ok) {
                const data = await res.json()
                setCards(data)
            }
        } catch (error) {
            console.error("Failed to fetch cards", error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchCards()
    }, [])

    // Filter expenses for current month for the preview
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const calculateCardInvoice = (cardId: string) => {
        return transactions
            .filter(t => {
                const tDate = new Date(t.date)
                return t.type === 'expense' &&
                    (t as any).card_id === cardId &&
                    tDate.getMonth() === currentMonth &&
                    tDate.getFullYear() === currentYear
            })
            .reduce((sum, t) => sum + Number(t.amount), 0)
    }

    if (isLoading) return <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

    if (cards.length === 0) return null; // Don't show if no cards

    // Helper to get bank style
    const getBankStyle = (card: CreditCard) => {
        let bankKey = card.brand;
        if (['mastercard', 'visa', 'elo', 'amex', 'other'].includes(card.brand)) {
            const lowerName = card.name.toLowerCase();
            for (const key of Object.keys(BANKS)) {
                if (lowerName.includes(key)) return BANKS[key];
            }
        }
        return BANKS[bankKey] || BANKS[card.brand] || BANKS['mastercard'];
    }

    const selectedCardTransactions = selectedCard
        ? transactions.filter(t => (t as any).card_id === selectedCard.id)
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-primary" /> Meus Cartões
                </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {cards.map(card => {
                    const style = getBankStyle(card)
                    const invoiceAmount = calculateCardInvoice(card.id)

                    return (
                        <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                                console.log("Clicked card", card.id)
                                setSelectedCard(card)
                            }}
                            className={`
                                relative min-w-[280px] md:min-w-[320px] h-48 rounded-2xl p-6 
                                flex flex-col justify-between shadow-lg snap-center cursor-pointer text-left
                                bg-gradient-to-br ${style.gradient} 
                                text-white overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl
                                border-none outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                            `}
                        >
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-black/20 rounded-full blur-3xl" />

                            {/* Top Row: Logo & Name */}
                            <div className="relative z-10 flex justify-between items-start w-full">
                                <div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={style.logo} alt={style.name} className="h-6 object-contain bg-white/20 p-1 rounded backdrop-blur-md" />
                                    <p className="mt-2 font-medium opacity-90">{card.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs opacity-70 uppercase font-semibold">Fatura Atual</p>
                                    <p className="text-xl font-bold tracking-tight">
                                        {formatCurrency(invoiceAmount)}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Row: Chip & Number */}
                            <div className="relative z-10 flex justify-between items-end w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-7 rounded bg-gradient-to-tr from-yellow-200 to-yellow-400 opacity-80 shadow-sm border border-yellow-500/30 relative overflow-hidden">
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-600/30" />
                                        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-yellow-600/30" />
                                        <div className="absolute top-0 right-1/3 w-[1px] h-full bg-yellow-600/30" />
                                    </div>
                                    <div className="font-mono text-sm opacity-80 tracking-widest">
                                        •••• {card.last_4_digits}
                                    </div>
                                </div>
                                <div className="opacity-80">
                                    {/* Brand Logo or Text could go here */}
                                    <span className="text-sm font-bold uppercase tracking-wider">{card.brand}</span>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedCard?.name}
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                •••• {selectedCard?.last_4_digits}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            Extrato completo e histórico de faturas deste cartão.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <TransactionList
                            transactions={selectedCardTransactions}
                            isLoading={false}
                            onUpdate={onUpdate || (() => { })}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
