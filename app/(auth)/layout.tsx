export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-xl">F</span>
                        </div>
                        <span className="text-white text-xl font-semibold">Finanças IA</span>
                    </div>
                </div>

                {/* Testimonial / Feature */}
                <div className="relative z-10 space-y-6">
                    <blockquote className="text-2xl font-light text-white/90 leading-relaxed">
                        "Controle suas finanças de forma inteligente com IA.
                        <span className="text-primary"> Simples, rápido e visual.</span>"
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs text-white/60">
                                    {i}k
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-white/60">Milhares de usuários gerenciando suas finanças</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-white/40">
                    © 2026 Finanças IA. Todos os direitos reservados.
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 bg-zinc-950 lg:bg-background">
                {/* Mobile Header with Gradient */}
                <div className="lg:hidden bg-gradient-to-b from-zinc-900 to-zinc-950 pt-safe">
                    <div className="px-6 py-8 flex flex-col items-center">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-primary-foreground font-bold text-2xl">F</span>
                        </div>
                        <p className="mt-3 text-zinc-400 text-sm">Finanças IA</p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:p-12">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>

                {/* Mobile Footer */}
                <div className="lg:hidden px-6 py-4 pb-safe text-center text-xs text-zinc-500">
                    © 2026 Finanças IA
                </div>
            </div>
        </div>
    )
}
