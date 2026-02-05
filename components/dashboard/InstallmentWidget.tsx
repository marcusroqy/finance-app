"use client"

import { useState } from "react"
import { Transaction } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle2, Pencil, Tags, Building2, DollarSign } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface InstallmentGroup {
    name: string;
    current: number;
    total: number;
    amount: number;
    brandLogo?: string;
    lastDate?: Date;
    category?: string;
    brand?: string;
    ids: string[]; // Track IDs for editing
}

export function InstallmentWidget({ transactions }: { transactions: Transaction[] }) {
    const router = useRouter()
    const [editingGroup, setEditingGroup] = useState<InstallmentGroup | null>(null)
    const [newName, setNewName] = useState("")
    const [newCategory, setNewCategory] = useState("")
    const [newBrand, setNewBrand] = useState("")
    const [newAmount, setNewAmount] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // 1. Grouping Logic
    const groups: Record<string, InstallmentGroup> = {};

    transactions.forEach(t => {
        const match = t.description.match(/(.*?)\s*\((\d+)\/(\d+)\)/);

        if (match) {
            let rawName = match[1].trim();
            const groupKey = rawName.replace(/\s+\d+x\b/i, '').toLowerCase();

            const current = parseInt(match[2]);
            const total = parseInt(match[3]);

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    name: rawName,
                    current: 0,
                    total: total,
                    amount: t.amount,
                    brandLogo: t.brand_logo_url,
                    category: t.category,
                    brand: t.brand,
                    ids: []
                };
            }

            groups[groupKey].ids.push(t.id);

            // Update to found properties
            if (current > groups[groupKey].current) {
                groups[groupKey].current = current;
                groups[groupKey].name = rawName;
                if (t.category) groups[groupKey].category = t.category;
            }

            if (current === total) {
                groups[groupKey].lastDate = new Date(t.date);
            }
        }
    });

    // 2. Filter & Sort
    const activeInstallments = Object.values(groups)
        .filter(g => {
            if (g.current < g.total) return true;
            if (g.lastDate && g.lastDate > new Date()) return true;
            return false;
        })
        .sort((a, b) => {
            const aActive = a.current < a.total;
            const bActive = b.current < b.total;
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            return b.amount - a.amount;
        });

    if (activeInstallments.length === 0) return null;

    // 3. Handlers
    const handleEditClick = (group: InstallmentGroup) => {
        setEditingGroup(group);
        setNewName(group.name.replace(/\s+\d+x\b/i, ''));
        setNewCategory(group.category || "General");
        setNewBrand(group.brand || "");
        setNewAmount(group.amount.toString());
    }

    const handleSave = async () => {
        if (!editingGroup || !newName) return;
        setIsSaving(true);

        try {
            const updates: any = {
                description: newName,
                category: newCategory,
                amount: parseFloat(newAmount) || editingGroup.amount
            };
            if (newBrand) updates.brand = newBrand;

            await fetch('/api/transactions/batch', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: editingGroup.ids,
                    updates
                })
            });

            router.refresh();
            setEditingGroup(null);
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            <Card className="border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-zinc-500">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Parcelamentos Ativos
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {activeInstallments.map((item, i) => {
                        const isCompleted = item.current === item.total;
                        const progress = (item.current / item.total) * 100;

                        return (
                            <div key={i} className={`space-y-2 group ${isCompleted ? 'opacity-75' : ''}`}>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium flex items-center gap-2">
                                        {item.brandLogo && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.brandLogo} alt="" className="w-4 h-4 rounded-full object-contain p-0.5 bg-white dark:bg-zinc-800" />
                                        )}
                                        {item.name.replace(/\s+\d+x\b/i, '')}

                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-600"
                                            title="Editar"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                    </span>
                                    <span className={`text-xs ${isCompleted ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                                        {isCompleted ? (
                                            <span className="flex items-center gap-1">Completed <CheckCircle2 className="w-3 h-3" /></span>
                                        ) : (
                                            `${item.current}/${item.total}`
                                        )}
                                    </span>
                                </div>

                                <Progress
                                    value={progress}
                                    className={`h-1.5 ${isCompleted ? '[&>div]:bg-emerald-500' : ''}`}
                                />

                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>R$ {item.amount} / mês</span>
                                    {!isCompleted && <span>R$ {((item.total - item.current) * item.amount).toFixed(0)} restante</span>}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do Parcelamento</DialogTitle>
                        <DialogDescription>
                            Ajuste valores, nomes e categorias.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">Nome do Item</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-10 bg-zinc-50 dark:bg-zinc-800/50"
                                placeholder="Ex: Macbook Pro"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                    <DollarSign className="w-3 h-3" /> Valor (Mês)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">R$</span>
                                    <Input
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        type="number"
                                        step="0.01"
                                        className="h-10 pl-9 bg-zinc-50 dark:bg-zinc-800/50"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                    <Tags className="w-3 h-3" /> Categoria
                                </Label>
                                <Select value={newCategory} onValueChange={setNewCategory}>
                                    <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-800/50">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">Geral</SelectItem>
                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                        <SelectItem value="Food">Alimentação</SelectItem>
                                        <SelectItem value="Transport">Transporte</SelectItem>
                                        <SelectItem value="Entertainment">Lazer</SelectItem>
                                        <SelectItem value="Health">Saúde</SelectItem>
                                        <SelectItem value="Utilities">Contas</SelectItem>
                                        <SelectItem value="Salary">Salário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="brand" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Marca
                            </Label>
                            <Input
                                id="brand"
                                value={newBrand}
                                onChange={(e) => setNewBrand(e.target.value)}
                                className="h-10 bg-zinc-50 dark:bg-zinc-800/50"
                                placeholder="Ex: Apple"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingGroup(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isSaving ? "Salvando..." : "Confirmar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
