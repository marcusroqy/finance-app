"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageSquare, LayoutDashboard, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSelector } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { t } = useLanguage()

    const supabase = createClient()
    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const routes = [
        {
            label: t.sidebar.chat,
            icon: MessageSquare,
            href: "/chat",
        },
        {
            label: t.sidebar.dashboard,
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            label: t.sidebar.settings,
            icon: Settings,
            href: "/settings",
        },
    ]

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-6">
                    <span className="h-6 w-6 rounded-sm bg-primary text-primary-foreground flex items-center justify-center mr-2 text-xs font-bold">F</span>
                    <h1 className="text-sm font-medium">{t.sidebar.appName}</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer rounded-sm transition-colors",
                                pathname === route.href
                                    ? "bg-sidebar-accent text-sidebar-foreground"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-4 w-4 mr-3 opacity-70", pathname === route.href ? "text-sidebar-foreground" : "text-muted-foreground")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="px-3">
                <div className="mb-2 px-2 space-y-1">
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground h-9 rounded-sm px-2"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4 mr-3 opacity-70" />
                    <span className="font-medium">{t.sidebar.signOut}</span>
                </Button>
            </div>
        </div>
    )
}
