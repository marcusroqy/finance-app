
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, List, Settings, LogOut, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/(auth)/actions'

const navigation = [
    { name: 'Dashboard', href: '/overview', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Transações', href: '/transactions', icon: List },
    { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("flex h-full flex-col bg-card border-r", className)}>
            <div className="p-6 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Finances AI</span>
            </div>

            <div className="flex-1 px-4 space-y-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t">
                <form action={signout}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </form>
            </div>
        </div>
    )
}
