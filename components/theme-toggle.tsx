"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/i18n/language-context"

export function ThemeToggle() {
    const { setTheme } = useTheme()
    const { t } = useLanguage()

    // Use dictionaries for labels if available, otherwise fallback
    const labels = {
        light: "Light",
        dark: "Dark",
        system: "System"
    }

    // Minimalist button that fits sidebar
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground h-9 rounded-sm px-2">
                    <Sun className="h-4 w-4 mr-3 opacity-70 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 mr-3 opacity-70 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="font-medium">Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[100]">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    {labels.light}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    {labels.dark}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    {labels.system}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
