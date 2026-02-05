import Link from 'next/link'
import { signup, signInWithGoogle } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    const { error, message } = await searchParams

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-foreground">
                    Crie sua conta
                </h1>
                <p className="text-sm text-zinc-400 lg:text-muted-foreground">
                    Comece a organizar suas finanças hoje
                </p>
            </div>

            {/* Google Button */}
            <form>
                <Button
                    formAction={signInWithGoogle}
                    variant="outline"
                    className="w-full h-14 gap-3 text-base font-medium bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700/50 lg:bg-background lg:border-input lg:text-foreground lg:hover:bg-accent"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Criar com Google
                </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-800 lg:bg-border" />
                <span className="text-xs text-zinc-500 lg:text-muted-foreground uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-zinc-800 lg:bg-border" />
            </div>

            {/* Form - Grouped iOS Style */}
            <form className="space-y-6">
                <div className="rounded-2xl overflow-hidden bg-zinc-800/50 lg:bg-transparent lg:space-y-4">
                    {/* Email Field */}
                    <div className="px-4 py-3 lg:p-0">
                        <Label htmlFor="email" className="text-xs text-zinc-400 uppercase tracking-wider lg:text-foreground lg:normal-case lg:tracking-normal lg:text-sm">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            className="mt-1 h-10 border-0 bg-transparent text-white placeholder:text-zinc-500 focus-visible:ring-0 px-0 lg:border lg:bg-background lg:text-foreground lg:h-12 lg:px-3"
                        />
                    </div>

                    {/* Separator for mobile */}
                    <div className="h-px bg-zinc-700/50 mx-4 lg:hidden" />

                    {/* Password Field */}
                    <div className="px-4 py-3 lg:p-0">
                        <Label htmlFor="password" className="text-xs text-zinc-400 uppercase tracking-wider lg:text-foreground lg:normal-case lg:tracking-normal lg:text-sm">
                            Senha
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                            className="mt-1 h-10 border-0 bg-transparent text-white placeholder:text-zinc-500 focus-visible:ring-0 px-0 lg:border lg:bg-background lg:text-foreground lg:h-12 lg:px-3"
                        />
                    </div>
                </div>

                {/* Error/Message Display */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm">
                        {message}
                    </div>
                )}

                <Button
                    formAction={signup}
                    className="w-full h-14 text-base font-semibold rounded-2xl"
                >
                    Criar Conta
                </Button>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-zinc-500 lg:text-muted-foreground">
                Ao criar conta, você concorda com os{' '}
                <Link href="#" className="underline">Termos</Link>
                {' '}e{' '}
                <Link href="#" className="underline">Privacidade</Link>.
            </p>

            {/* Footer */}
            <p className="text-center text-sm text-zinc-400 lg:text-muted-foreground">
                Já tem conta?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                    Entrar
                </Link>
            </p>
        </div>
    )
}
