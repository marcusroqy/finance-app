"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
    const [showInstall, setShowInstall] = React.useState(false)
    const [isInstalled, setIsInstalled] = React.useState(false)

    React.useEffect(() => {
        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true)
            return
        }

        // iOS standalone check
        if ((window.navigator as any).standalone === true) {
            setIsInstalled(true)
            return
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log("[PWA] beforeinstallprompt event fired")
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowInstall(true)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        // Listen for successful installation
        const handleAppInstalled = () => {
            console.log("[PWA] App was installed")
            setShowInstall(false)
            setDeferredPrompt(null)
            setIsInstalled(true)
        }

        window.addEventListener("appinstalled", handleAppInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.log("[PWA] No deferred prompt available")
            return
        }

        console.log("[PWA] Showing install prompt")
        await deferredPrompt.prompt()

        const { outcome } = await deferredPrompt.userChoice
        console.log("[PWA] User choice:", outcome)

        if (outcome === "accepted") {
            setShowInstall(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowInstall(false)
        // Don't show again for this session
        sessionStorage.setItem("pwa-install-dismissed", "true")
    }

    // Don't show if installed or dismissed
    if (isInstalled) return null
    if (!showInstall) return null
    if (typeof window !== "undefined" && sessionStorage.getItem("pwa-install-dismissed")) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-card border rounded-2xl p-4 shadow-lg flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Instalar Finanças IA</p>
                    <p className="text-xs text-muted-foreground">Acesse mais rápido na tela inicial</p>
                </div>
                <Button size="sm" onClick={handleInstallClick} className="shrink-0">
                    Instalar
                </Button>
                <button
                    onClick={handleDismiss}
                    className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
