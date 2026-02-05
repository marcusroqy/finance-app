import Link from 'next/link'
import { resetPassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    const { error, message } = await searchParams

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
            </Link>

            {/* Header */}
            <div className="space-y-2 text-center lg:text-left">
                <div className="lg:hidden flex justify-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-2xl">F</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Recuperar senha</h1>
                <p className="text-muted-foreground">
                    Digite seu email e enviaremos instruções para redefinir sua senha.
                </p>
            </div>

            {/* Form */}
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        className="h-12"
                    />
                </div>

                {/* Error/Message Display */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm space-y-2">
                        <p className="font-medium">Email enviado!</p>
                        <p>{message}</p>
                    </div>
                )}

                <Button formAction={resetPassword} className="w-full h-12 text-base font-medium">
                    Enviar link de recuperação
                </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                    Fazer login
                </Link>
            </p>
        </div>
    )
}
