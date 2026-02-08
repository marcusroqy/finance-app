"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { useEffect, useState } from "react"

export function AppHeader() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <div className="flex items-center p-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <div className="flex items-center gap-2 ml-2">
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        Finanças IA
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">v2.12 (Original)</span>
                </div>
                <SheetContent side="left" className="p-0 bg-slate-900 border-none text-white w-72">
                    <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                    <AppSidebar />
                </SheetContent>
            </Sheet>
        </div>
    )
}
