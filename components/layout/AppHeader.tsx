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
                <SheetContent side="left" className="p-0 bg-slate-900 border-none text-white w-72">
                    <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                    <AppSidebar />
                </SheetContent>
            </Sheet>
        </div>
    )
}
