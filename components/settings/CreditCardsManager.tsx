
"use client"

import { useState, useEffect } from "react"
import { Plus, CreditCard, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface CreditCard {
    id: string
    name: string
    last_4_digits: string
    brand: string
    color: string
}

export function CreditCardsManager() {
    const [cards, setCards] = useState<CreditCard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form State
    const [newName, setNewName] = useState("")
    const [newDigits, setNewDigits] = useState("")
    const [newBrand, setNewBrand] = useState("mastercard")
    const [newColor, setNewColor] = useState("#000000")

    const fetchCards = async () => {
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

    useEffect(() => {
        fetchCards()
    }, [])

    const handleAddCard = async () => {
        if (!newName || !newDigits || newDigits.length !== 4) {
            toast.error("Preencha o nome e os últimos 4 dígitos corretamente.")
            return
        }

        setIsAdding(true)
        try {
            const res = await fetch('/api/credit-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    last_4_digits: newDigits,
                    brand: newBrand,
                    color: newColor
                })
            })

            if (res.ok) {
                toast.success("Cartão adicionado com sucesso!")
                setNewName("")
                setNewDigits("")
                setIsDialogOpen(false)
                fetchCards()
            } else {
                toast.error("Erro ao adicionar cartão.")
            }
        } catch (error) {
            toast.error("Erro de conexão.")
        } finally {
            setIsAdding(false)
        }
    }

    const handleDeleteCard = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este cartão?")) return

        try {
            const res = await fetch(`/api/credit-cards/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success("Cartão removido.")
                setCards(cards.filter(c => c.id !== id))
            } else {
                toast.error("Erro ao remover cartão.")
            }
        } catch (error) {
            toast.error("Erro ao remover cartão.")
        }
    }

    const getBrandColor = (brand: string) => {
        switch (brand) {
            case 'nubank': return 'bg-[#820AD1]';
            case 'inter': return 'bg-[#FF7A00]';
            case 'itau': return 'bg-[#EC7000]';
            case 'xp': return 'bg-[#000000]';
            case 'c6': return 'bg-[#242424]';
            case 'visa': return 'bg-[#1A1F71]';
            case 'mastercard': return 'bg-[#EB001B]';
            default: return 'bg-zinc-800';
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Meus Cartões</CardTitle>
                    <CardDescription>Gerencie seus cartões para uso no chat.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Cartão</DialogTitle>
                            <DialogDescription>
                                Informe apenas os dados básicos para identificação.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Apelido do Cartão</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Nubank, Inter Black"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="digits">Últimos 4 dígitos</Label>
                                    <Input
                                        id="digits"
                                        placeholder="1234"
                                        maxLength={4}
                                        value={newDigits}
                                        onChange={(e) => setNewDigits(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="brand">Bandeira / Banco</Label>
                                    <Select value={newBrand} onValueChange={setNewBrand}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mastercard">Mastercard</SelectItem>
                                            <SelectItem value="visa">Visa</SelectItem>
                                            <SelectItem value="nubank">Nubank</SelectItem>
                                            <SelectItem value="inter">Inter</SelectItem>
                                            <SelectItem value="itau">Itaú</SelectItem>
                                            <SelectItem value="xp">XP</SelectItem>
                                            <SelectItem value="c6">C6 Bank</SelectItem>
                                            <SelectItem value="amex">Amex</SelectItem>
                                            <SelectItem value="elo">Elo</SelectItem>
                                            <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAddCard} disabled={isAdding}>
                                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Cartão"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : cards.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum cartão cadastrado.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {cards.map((card) => (
                            <div key={card.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-8 rounded-md ${getBrandColor(card.brand)} shadow-sm flex items-center justify-center`}>
                                        <CreditCard className="w-4 h-4 text-white/80" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{card.name}</p>
                                        <p className="text-xs text-muted-foreground">•••• {card.last_4_digits}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteCard(card.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
