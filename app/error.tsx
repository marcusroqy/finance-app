"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                    Algo deu errado
                </h2>
                <p className="text-sm text-muted-foreground">
                    Um erro inesperado ocorreu. Tente recarregar a página.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground font-mono bg-muted p-1 rounded">
                        Código: {error.digest}
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Recarregar Página
                </Button>
                <Button onClick={() => reset()}>Tentar Novamente</Button>
            </div>
        </div>
    )
}
