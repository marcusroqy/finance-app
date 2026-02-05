"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageSelector } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

// Icons
import { User, Mail, Globe, Camera, Save, AlertTriangle, Download, Trash2, Loader2 } from "lucide-react"

export default function SettingsPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const supabase = createClient()

    const [profile, setProfile] = React.useState<Profile | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form state
    const [fullName, setFullName] = React.useState("")
    const [website, setWebsite] = React.useState("")
    const [avatarUrl, setAvatarUrl] = React.useState("")

    // Fetch profile on mount
    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile')
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data)
                    setFullName(data.full_name || "")
                    setWebsite(data.website || "")
                    setAvatarUrl(data.avatar_url || "")
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName, website, avatar_url: avatarUrl })
            })
            if (res.ok) {
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
            } else {
                const err = await res.json()
                setMessage({ type: 'error', text: err.error || 'Erro ao salvar' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Falha na conexão' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !profile) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        setMessage({ type: 'success', text: 'Enviando imagem...' })

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true })

        if (uploadError) {
            setMessage({ type: 'error', text: 'Erro ao enviar imagem' })
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        setAvatarUrl(publicUrl)
        setMessage({ type: 'success', text: 'Imagem enviada! Clique em Salvar.' })
    }

    const handleExportData = async () => {
        try {
            const res = await fetch('/api/transactions')
            if (res.ok) {
                const data = await res.json()
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `financas-ia-export-${new Date().toISOString().split('T')[0]}.json`
                a.click()
            }
        } catch (error) {
            console.error("Export failed", error)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-sm text-muted-foreground">Gerencie seu perfil e preferências.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="preferences">Preferências</TabsTrigger>
                    <TabsTrigger value="data">Dados</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Perfil</CardTitle>
                            <CardDescription>Atualize suas informações pessoais.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                                        <AvatarImage src={avatarUrl} alt={fullName} />
                                        <AvatarFallback className="text-2xl bg-primary/10">
                                            {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-medium">{fullName || "Seu Nome"}</h3>
                                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Fields */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="flex items-center gap-2">
                                        <User className="w-4 h-4" /> Nome Completo
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email
                                    </Label>
                                    <Input
                                        id="email"
                                        value={profile?.email || ""}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="website" className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Website
                                    </Label>
                                    <Input
                                        id="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://seusite.com"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`p-3 rounded-md text-sm ${message.type === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Save Button */}
                            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PREFERENCES TAB */}
                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aparência</CardTitle>
                            <CardDescription>Personalize a interface do aplicativo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Tema</p>
                                    <p className="text-sm text-muted-foreground">Escolha entre claro, escuro ou sistema.</p>
                                </div>
                                <ThemeToggle />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Idioma</p>
                                    <p className="text-sm text-muted-foreground">Selecione o idioma da interface.</p>
                                </div>
                                <LanguageSelector />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DATA TAB */}
                <TabsContent value="data" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exportar Dados</CardTitle>
                            <CardDescription>Baixe uma cópia de todas as suas transações.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onClick={handleExportData}>
                                <Download className="w-4 h-4 mr-2" /> Exportar JSON
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-red-500 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                            </CardTitle>
                            <CardDescription>Ações irreversíveis. Tenha cuidado.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20">
                                <div>
                                    <p className="font-medium">Sair da Conta</p>
                                    <p className="text-sm text-muted-foreground">Encerrar sessão atual.</p>
                                </div>
                                <Button variant="destructive" onClick={handleSignOut}>
                                    Sair
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
