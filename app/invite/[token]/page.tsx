"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Users, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

type InviteStatus = "loading" | "valid" | "expired" | "used" | "error" | "success" | "wrong_email"

interface InviteData {
    id: string
    email: string
    household: {
        id: string
        name: string
    }
    expires_at: string
}

export default function InvitePage() {
    const router = useRouter()
    const params = useParams()
    const token = params.token as string
    const { locale } = useLanguage()

    const [status, setStatus] = React.useState<InviteStatus>("loading")
    const [invite, setInvite] = React.useState<InviteData | null>(null)
    const [isAccepting, setIsAccepting] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const isPt = locale === 'pt'

    React.useEffect(() => {
        const checkInvite = async () => {
            try {
                const res = await fetch(`/api/household/invite/${token}`)
                const data = await res.json()

                if (!res.ok) {
                    if (data.status === "expired") {
                        setStatus("expired")
                    } else if (data.status === "accepted" || data.status === "rejected") {
                        setStatus("used")
                    } else {
                        setStatus("error")
                        setErrorMessage(data.error)
                    }
                    return
                }

                setInvite(data.invite)
                setStatus("valid")
            } catch (error) {
                setStatus("error")
                setErrorMessage("Failed to load invite")
            }
        }

        checkInvite()
    }, [token])

    const handleAccept = async () => {
        setIsAccepting(true)
        try {
            const res = await fetch(`/api/household/invite/${token}`, {
                method: "POST"
            })
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 401) {
                    // Not logged in, redirect to login with return URL
                    router.push(`/login?redirect=/invite/${token}`)
                    return
                }
                if (res.status === 403) {
                    setStatus("wrong_email")
                    setErrorMessage(data.inviteEmail)
                    return
                }
                throw new Error(data.error)
            }

            setStatus("success")
            toast.success(isPt ? "Convite aceito!" : "Invite accepted!")

            setTimeout(() => {
                router.push("/dashboard")
            }, 2000)
        } catch (error: any) {
            toast.error(error.message || "Failed to accept invite")
        } finally {
            setIsAccepting(false)
        }
    }

    const renderContent = () => {
        switch (status) {
            case "loading":
                return (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">
                            {isPt ? "Carregando convite..." : "Loading invite..."}
                        </p>
                    </div>
                )

            case "valid":
                return (
                    <>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">
                                {isPt ? "Convite para Família" : "Family Invite"}
                            </CardTitle>
                            <CardDescription>
                                {isPt
                                    ? `Você foi convidado(a) para fazer parte de "${invite?.household?.name}"`
                                    : `You've been invited to join "${invite?.household?.name}"`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg bg-muted/50 p-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {isPt ? "Convite enviado para" : "Invite sent to"}
                                </p>
                                <p className="font-medium">{invite?.email}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleAccept}
                                    disabled={isAccepting}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isAccepting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isPt ? "Aceitando..." : "Accepting..."}
                                        </>
                                    ) : (
                                        isPt ? "Aceitar Convite" : "Accept Invite"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/")}
                                    className="w-full"
                                >
                                    {isPt ? "Recusar" : "Decline"}
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )

            case "success":
                return (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <CardTitle>
                            {isPt ? "Convite Aceito!" : "Invite Accepted!"}
                        </CardTitle>
                        <p className="text-center text-muted-foreground">
                            {isPt
                                ? "Redirecionando para o dashboard..."
                                : "Redirecting to dashboard..."
                            }
                        </p>
                    </div>
                )

            case "expired":
                return (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                            <AlertCircle className="h-8 w-8 text-yellow-500" />
                        </div>
                        <CardTitle>
                            {isPt ? "Convite Expirado" : "Invite Expired"}
                        </CardTitle>
                        <p className="text-center text-muted-foreground">
                            {isPt
                                ? "Este convite não é mais válido. Peça um novo convite."
                                : "This invite is no longer valid. Please request a new one."
                            }
                        </p>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            {isPt ? "Ir para Início" : "Go to Home"}
                        </Button>
                    </div>
                )

            case "wrong_email":
                return (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                            <AlertCircle className="h-8 w-8 text-yellow-500" />
                        </div>
                        <CardTitle>
                            {isPt ? "Email Diferente" : "Different Email"}
                        </CardTitle>
                        <p className="text-center text-muted-foreground">
                            {isPt
                                ? `Este convite foi enviado para ${errorMessage}. Faça login com esse email.`
                                : `This invite was sent to ${errorMessage}. Please login with that email.`
                            }
                        </p>
                        <Button onClick={() => router.push("/login")}>
                            {isPt ? "Fazer Login" : "Login"}
                        </Button>
                    </div>
                )

            default:
                return (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <CardTitle>
                            {isPt ? "Convite Inválido" : "Invalid Invite"}
                        </CardTitle>
                        <p className="text-center text-muted-foreground">
                            {errorMessage || (isPt ? "Este convite não existe." : "This invite doesn't exist.")}
                        </p>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            {isPt ? "Ir para Início" : "Go to Home"}
                        </Button>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                {renderContent()}
            </Card>
        </div>
    )
}
