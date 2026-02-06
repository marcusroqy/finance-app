"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, UserPlus, Copy, Loader2, Trash2, Crown, LogOut } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { Household, HouseholdMember, HouseholdInvite } from "@/lib/types"

interface HouseholdData {
    household: Household
    role: 'owner' | 'member'
    members: HouseholdMember[]
    pendingInvites: HouseholdInvite[]
}

export function HouseholdSettings() {
    const { locale } = useLanguage()
    const isPt = locale === 'pt'

    const [data, setData] = React.useState<HouseholdData | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [inviteEmail, setInviteEmail] = React.useState("")
    const [isSendingInvite, setIsSendingInvite] = React.useState(false)
    const [lastInviteLink, setLastInviteLink] = React.useState("")
    const [householdName, setHouseholdName] = React.useState("")
    const [isEditingName, setIsEditingName] = React.useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/household")
            const json = await res.json()

            console.log("[HouseholdSettings] API Response:", res.status, json)

            if (res.ok) {
                setData(json)
                setHouseholdName(json.household?.name || "")
            } else {
                setError(json.error || `HTTP ${res.status}`)
            }
        } catch (err: any) {
            console.error("Failed to fetch household", err)
            setError(err.message || "Network error")
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) return

        setIsSendingInvite(true)
        try {
            const res = await fetch("/api/household/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail.trim() })
            })
            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error)
            }

            setLastInviteLink(result.inviteLink)
            setInviteEmail("")
            toast.success(isPt ? "Convite criado!" : "Invite created!")
            fetchData()
        } catch (error: any) {
            toast.error(error.message || (isPt ? "Erro ao enviar convite" : "Failed to send invite"))
        } finally {
            setIsSendingInvite(false)
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(lastInviteLink)
        toast.success(isPt ? "Link copiado!" : "Link copied!")
    }

    const handleCancelInvite = async (inviteId: string) => {
        try {
            const res = await fetch(`/api/household/invite?id=${inviteId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error()
            toast.success(isPt ? "Convite cancelado" : "Invite cancelled")
            fetchData()
        } catch {
            toast.error(isPt ? "Erro ao cancelar" : "Failed to cancel")
        }
    }

    const handleUpdateName = async () => {
        try {
            const res = await fetch("/api/household", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: householdName })
            })
            if (!res.ok) throw new Error()
            toast.success(isPt ? "Nome atualizado!" : "Name updated!")
            setIsEditingName(false)
            fetchData()
        } catch {
            toast.error(isPt ? "Erro ao atualizar" : "Failed to update")
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="py-8 text-center space-y-4">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-yellow-500/10">
                        <Users className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold">
                            {isPt ? "Erro ao Carregar" : "Failed to Load"}
                        </h3>
                        {error && (
                            <p className="text-sm text-red-500 mt-2 font-mono">
                                {error}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                            {isPt
                                ? "Não foi possível carregar os dados da família."
                                : "Could not load household data."
                            }
                        </p>
                    </div>
                    <Button onClick={fetchData} variant="outline">
                        {isPt ? "Tentar Novamente" : "Try Again"}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const isOwner = data.role === 'owner'

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            {isPt ? "Família" : "Household"}
                            {isOwner && (
                                <Badge variant="secondary" className="text-xs">
                                    <Crown className="mr-1 h-3 w-3" />
                                    {isPt ? "Dono" : "Owner"}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {isPt
                                ? "Gerencie sua família e membros compartilhados"
                                : "Manage your household and shared members"
                            }
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Household Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {isPt ? "Nome da Família" : "Household Name"}
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={householdName}
                            onChange={(e) => {
                                setHouseholdName(e.target.value)
                                setIsEditingName(true)
                            }}
                            disabled={!isOwner}
                            placeholder={isPt ? "Ex: Família Silva" : "Ex: The Smiths"}
                        />
                        {isEditingName && isOwner && (
                            <Button onClick={handleUpdateName} size="sm">
                                {isPt ? "Salvar" : "Save"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Members */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                        {isPt ? "Membros" : "Members"} ({data.members.length})
                    </h4>
                    <div className="space-y-2">
                        {data.members.map((member: any) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.profiles?.avatar_url} />
                                    <AvatarFallback>
                                        {(member.profiles?.full_name || member.profiles?.email || "?")[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {member.profiles?.full_name || member.profiles?.email || "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {member.profiles?.email}
                                    </p>
                                </div>
                                {member.role === 'owner' && (
                                    <Badge variant="outline" className="shrink-0">
                                        <Crown className="mr-1 h-3 w-3" />
                                        {isPt ? "Dono" : "Owner"}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invite (only for owners) */}
                {isOwner && (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            {isPt ? "Convidar Membro" : "Invite Member"}
                        </h4>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder={isPt ? "Email do convidado" : "Invite email"}
                            />
                            <Button
                                onClick={handleSendInvite}
                                disabled={isSendingInvite || !inviteEmail.trim()}
                            >
                                {isSendingInvite ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    isPt ? "Convidar" : "Invite"
                                )}
                            </Button>
                        </div>

                        {/* Invite Link */}
                        {lastInviteLink && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                                    {isPt
                                        ? "Envie este link para o convidado:"
                                        : "Send this link to the invitee:"
                                    }
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        value={lastInviteLink}
                                        readOnly
                                        className="text-xs"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={handleCopyLink}
                                        title={isPt ? "Copiar Link" : "Copy Link"}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none"
                                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(isPt ? `Entre para minha família no Finance AI: ${lastInviteLink}` : `Join my household on Finance AI: ${lastInviteLink}`)}`, '_blank')}
                                        title="WhatsApp"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Pending Invites */}
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {isPt ? "Convites pendentes:" : "Pending invites:"}
                            </p>
                            {data.pendingInvites.map((invite) => {
                                const inviteLink = `${window.location.origin}/invite/${invite.token}`;

                                return (
                                    <div
                                        key={invite.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                                    >
                                        <div className="flex flex-col min-w-0 mr-2">
                                            <span className="text-sm font-medium truncate">{invite.email}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {isPt ? "Pendente" : "Pending"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(isPt ? `Entre para minha família no Finance AI: ${inviteLink}` : `Join my household on Finance AI: ${inviteLink}`)}`, '_blank')}
                                                title="WhatsApp"
                                            >
                                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(inviteLink);
                                                    toast.success(isPt ? "Link copiado!" : "Link copied!");
                                                }}
                                                title={isPt ? "Copiar Link" : "Copy Link"}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleCancelInvite(invite.id)}
                                                title={isPt ? "Cancelar" : "Cancel"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
