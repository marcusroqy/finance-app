
"use client"

import { useState, useEffect } from "react"
import { Plus, CreditCard, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BANKS } from "@/lib/parser"
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

    const [editingCard, setEditingCard] = useState<CreditCard | null>(null)

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

    const handleEditClick = (card: CreditCard) => {
        setEditingCard(card)
        setNewName(card.name)
        setNewDigits(card.last_4_digits)
        setNewBrand(card.brand)
        setNewColor(card.color)
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setNewName("")
        setNewDigits("")
        setNewBrand("mastercard")
        setNewColor("#000000")
        setEditingCard(null)
    }

    const handleSaveCard = async () => {
        if (!newName || !newDigits || newDigits.length !== 4) {
            toast.error("Preencha o nome e os últimos 4 dígitos corretamente.")
            return
        }

        setIsAdding(true)
        try {
            const url = editingCard ? `/api/credit-cards/${editingCard.id}` : '/api/credit-cards';
            const method = editingCard ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    last_4_digits: newDigits,
                    brand: newBrand,
                    color: newColor
                })
            })

            if (res.ok) {
                toast.success(editingCard ? "Cartão atualizado!" : "Cartão adicionado com sucesso!")
                resetForm()
                setIsDialogOpen(false)
                fetchCards()
            } else {
                toast.error("Erro ao salvar cartão.")
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


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Meus Cartões</CardTitle>
                    <CardDescription>Gerencie seus cartões para uso no chat.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
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
                            <Button onClick={handleSaveCard} disabled={isAdding}>
                                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCard ? "Atualizar" : "Salvar Cartão")}
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
                        {cards.map((card) => {
                            // Genius Style Inference 🧠
                            let bankKey = card.brand;
                            if (['mastercard', 'visa', 'elo', 'amex', 'other'].includes(card.brand)) {
                                const lowerName = card.name.toLowerCase();
                                for (const key of Object.keys(BANKS)) {
                                    if (lowerName.includes(key)) {
                                        bankKey = key;
                                        break;
                                    }
                                }
                            }
                            const bankStyle = BANKS[bankKey] || BANKS[card.brand] || BANKS['mastercard'];

                            return (
                                <div key={card.id} className={`relative overflow-hidden p-4 rounded-xl border-0 shadow-md group transition-all hover:scale-[1.01] bg-gradient-to-br ${bankStyle.gradient}`}>
                                    {/* Background Pattern/Overlay */}
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                                    <div className={`relative flex items-center justify-between z-10 ${bankStyle.text}`}>
                                        {/* Left: Chip & Info */}
                                        <div className="flex flex-col gap-3">
                                            {/* Chip Icon */}
                                            <div className="w-10 h-7 rounded bg-gradient-to-tr from-yellow-200 to-yellow-400 opacity-80 shadow-sm border border-yellow-500/30 relative overflow-hidden">
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-600/30" />
                                                <div className="absolute top-0 left-1/3 w-[1px] h-full bg-yellow-600/30" />
                                                <div className="absolute top-0 right-1/3 w-[1px] h-full bg-yellow-600/30" />
                                            </div>

                                            <div>
                                                <p className="font-medium text-base tracking-wide truncate max-w-[140px]">{card.name}</p>
                                                <p className="font-mono text-xs opacity-80 tracking-widest gap-1 flex">
                                                    <span>••••</span> <span>••••</span> <span>••••</span> <span>{card.last_4_digits}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Actions & Logo */}
                                        <div className="flex flex-col justify-between items-end h-full gap-2">
                                            <div className="bg-white/90 p-1 rounded-md shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={bankStyle.logo}
                                                    alt={bankStyle.name}
                                                    className="w-5 h-5 object-contain"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
                                                onClick={() => handleDeleteCard(card.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
