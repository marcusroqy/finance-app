"use client"

import * as React from "react"
import { format } from "date-fns"
import { MoreHorizontal, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Utensils, Car, Zap, ShoppingBag, Film, Heart, Briefcase, CreditCard } from "lucide-react"
import { Transaction } from "@/lib/types"
import { BRANDS } from "@/lib/parser"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { useLanguage } from "@/lib/i18n/language-context"
import { ptBR, enUS } from "date-fns/locale"

const CATEGORY_ICONS: Record<string, any> = {
    Food: Utensils,
    Transport: Car,
    Utilities: Zap,
    Shopping: ShoppingBag,
    Entertainment: Film,
    Health: Heart,
    Salary: Briefcase,
    General: CreditCard
}

interface TransactionItemProps {
    transaction: Transaction
    onDelete: (id: string) => void
    onEdit: (transaction: Transaction) => void
}

export function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
    const { t, locale } = useLanguage()
    const isIncome = transaction.type === "income"
    // Use Category Icon
    const CategoryIcon = CATEGORY_ICONS[transaction.category] || (isIncome ? ArrowUpCircle : ArrowDownCircle)

    // Choose dynamic color based on category/type
    let colorClass = isIncome ? "text-emerald-500" : "text-zinc-500"
    if (!isIncome) {
        switch (transaction.category) {
            case 'Food': colorClass = "text-orange-500"; break;
            case 'Transport': colorClass = "text-blue-500"; break;
            case 'Utilities': colorClass = "text-yellow-500"; break;
            case 'Shopping': colorClass = "text-purple-500"; break;
            case 'Entertainment': colorClass = "text-pink-500"; break;
            case 'Health': colorClass = "text-red-500"; break;
        }
    }

    const dateLocale = locale === 'pt' ? ptBR : enUS

    // Helper to translate category if key exists, else return original
    const displayCategory = t.categories[transaction.category as keyof typeof t.categories] || transaction.category

    // Helper to translate description if it matches a generic fallback like "Income" or "Expense", otherwise keep original
    let displayDescription = transaction.description
    if (transaction.description === 'Income') displayDescription = t.categories.Income
    if (transaction.description === 'Expense') displayDescription = t.transactions.expense

    // Professional Badge Extraction 🏷️
    // 1. Installment: "(1/10)"
    const installmentMatch = displayDescription.match(/\((\d+\/\d+)\)/);
    let installmentBadge = null;
    if (installmentMatch) {
        installmentBadge = installmentMatch[1];
        displayDescription = displayDescription.replace(installmentMatch[0], '').trim();
    }

    // 2. Payment Method: "[Pix]", "[Crédito]"
    const paymentMatch = displayDescription.match(/\[(Pix|Crédito|Débito|Dinheiro|Credit|Debit|Cash)\]/i);
    let paymentBadge = null;
    if (paymentMatch) {
        paymentBadge = paymentMatch[1];
        // Normalize display
        if (paymentBadge.toLowerCase().includes('credit') || paymentBadge.toLowerCase().includes('crédito')) paymentBadge = 'Crédito';
        else if (paymentBadge.toLowerCase().includes('debits') || paymentBadge.toLowerCase().includes('débito')) paymentBadge = 'Débito';
        else if (paymentBadge.toLowerCase().includes('cash') || paymentBadge.toLowerCase().includes('dinheiro')) paymentBadge = 'Dinheiro';

        displayDescription = displayDescription.replace(paymentMatch[0], '').trim();
    }

    // Fallback: Detect Brand from Description if not in DB (for old transactions)
    let logoUrl = transaction.brand_logo_url;
    let brandName = transaction.brand;

    const lowerDesc = displayDescription.toLowerCase();

    // Force Dictionary Lookup to ensure we use the latest working URL preference
    // This allows us to hot-swap Clearbit for Google Favicons without migrating the DB
    for (const b of Object.values(BRANDS)) {
        if (transaction.brand === b.name || b.keywords.some(k => lowerDesc.includes(k))) {
            logoUrl = b.logo; // Override with dictionary logo
            if (!brandName) brandName = b.name;
            break;
        }
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`relative h-10 w-10 flex items-center justify-center rounded-full overflow-hidden ${!logoUrl ? (isIncome ? "bg-emerald-500/10" : "bg-rose-500/10") : "bg-white dark:bg-zinc-800"}`}>
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoUrl}
                            alt={brandName || "Brand"}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                                // Fallback if image fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    {/* Fallback Icon (hidden if logo loads successfully) */}
                    <CategoryIcon className={`w-5 h-5 ${colorClass} ${logoUrl ? "hidden" : ""}`} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                            {brandName ? brandName : displayDescription}
                        </p>
                        {installmentBadge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-medium">
                                {installmentBadge}
                            </span>
                        )}
                        {paymentBadge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${paymentBadge === 'Pix' ? 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800' :
                                paymentBadge === 'Crédito' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800' :
                                    'bg-zinc-100 text-zinc-600 border-zinc-200'
                                }`}>
                                {paymentBadge}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="capitalize">{format(new Date(transaction.date), "dd MMM", { locale: dateLocale })}</span>
                        <span>•</span>
                        <span>{displayCategory}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className={`font-semibold ${colorClass}`}>
                    {isIncome ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                </span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            <Pencil className="mr-2 h-4 w-4" /> {t.transactions.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => onDelete(transaction.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> {t.transactions.delete}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
