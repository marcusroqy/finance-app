"use client"

import React from "react"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }
            return (
                <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center p-6 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-50 text-amber-500" />
                    <p className="text-sm font-medium">Erro ao carregar componente</p>
                    <p className="text-xs opacity-70 mt-1 max-w-[200px] text-center truncate">
                        {this.state.error?.message || "Erro desconhecido"}
                    </p>
                </div>
            )
        }

        return this.props.children
    }
}
