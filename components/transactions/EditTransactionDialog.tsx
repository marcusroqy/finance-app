"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Transaction } from "@/lib/types"

interface EditTransactionDialogProps {
    transaction: Transaction | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

import { useLanguage } from "@/lib/i18n/language-context"

export function EditTransactionDialog({
    transaction,
    open,
    onOpenChange,
    onSuccess,
}: EditTransactionDialogProps) {
    const { t } = useLanguage()
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState<Partial<Transaction>>({
        amount: 0,
        description: "",
        category: "",
        type: "expense"
    })

    React.useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                type: transaction.type
            })
        }
    }, [transaction])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!transaction) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/transactions/${transaction.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error("Failed to update")

            toast.success(t.transactions.successfullyUpdated)
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error(t.transactions.updateError)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.transactions.title}</DialogTitle>
                    <DialogDescription>
                        {t.dashboard.overview}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                {t.transactions.type}
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={t.transactions.selectType} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">{t.transactions.income}</SelectItem>
                                    <SelectItem value="expense">{t.transactions.expense}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                {t.transactions.amount}
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                {t.transactions.description}
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                {t.transactions.category}
                            </Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>{t.transactions.save}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
