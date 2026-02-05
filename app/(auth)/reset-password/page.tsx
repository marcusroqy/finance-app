import Link from 'next/link'
import { updatePassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound } from 'lucide-react'

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <KeyRound className="w-7 h-7 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Nova senha</h1>
                <p className="text-muted-foreground">
                    Digite sua nova senha abaixo. Ela deve ter pelo menos 6 caracteres.
                </p>
            </div>

            {/* Form */}
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Digite novamente"
                        required
                        minLength={6}
                        className="h-12"
                    />
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <Button formAction={updatePassword} className="w-full h-12 text-base font-medium">
                    Atualizar Senha
                </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary font-medium hover:underline">
                    Voltar para login
                </Link>
            </p>
        </div>
    )
}
