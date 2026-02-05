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
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Pending Invites */}
                        {data.pendingInvites.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {isPt ? "Convites pendentes:" : "Pending invites:"}
                                </p>
                                {data.pendingInvites.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="flex items-center justify-between p-2 rounded bg-muted/30"
                                    >
                                        <span className="text-sm">{invite.email}</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleCancelInvite(invite.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
