"use client"

import * as React from "react"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

import { ChatInput } from "./ChatInput"
import { ChatMessage, Message } from "./ChatMessage"
import { parseMessage, ParsedTransaction } from "@/lib/parser"
import { useLanguage } from "@/lib/i18n/language-context"

export function ChatContainer() {
    const { t } = useLanguage()
    const [messages, setMessages] = React.useState<Message[]>([])
    const [isSending, setIsSending] = React.useState(false)
    const [pendingTransaction, setPendingTransaction] = React.useState<ParsedTransaction | null>(null)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return

        // Add User Message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content,
            createdAt: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setIsSending(true)

        try {
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 600))

            // 1. Check if we are waiting for something (Pending State)
            if (pendingTransaction) {
                await handlePendingState(content);
                return;
            }

            // 2. Normal Parsing
            const parsed = parseMessage(content)

            if (parsed) {
                // Check Status from Parser
                if (parsed.status === 'missing_amount') {
                    // Smart Response based on Brand/Context
                    let question = `Entendi que é sobre "${parsed.description}". Quanto custou?`;

                    if (parsed.brand) {
                        switch (parsed.brand.toLowerCase()) {
                            case 'uber':
                                question = "Vai de Uber? 🚗 Quanto deu a corrida e como você pagou (Crédito/Débito)?";
                                break;
                            case 'ifood':
                                question = "Hum, iFood! 🍔 Quanto custou o pedido e qual foi o pagamento?";
                                break;
                            case 'netflix':
                                question = "Netflix time! 🍿 Qual o valor da mensalidade e o cartão?";
                                break;
                            case 'spotify':
                                question = "Música é vida! 🎧 Quanto foi a assinatura do Spotify?";
                                break;
                            case 'mcdonald\'s':
                            case 'burger king':
                                question = "Lanche top! 🍟 Quanto deu tudo e como pagou?";
                                break;
                            default:
                                question = `Vi que é ${parsed.brand}. Quanto foi e qual a forma de pagamento?`;
                                break;
                        }
                    } else if (parsed.category === 'Transport') {
                        question = "Transporte! 🚕 Quanto você gastou e como pagou?";
                    } else if (parsed.category === 'Food') {
                        question = "Comida! 🍽️ Qual o valor e a forma de pagamento?";
                    }

                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: question,
                        createdAt: new Date()
                    }
                    setMessages(prev => [...prev, aiResponse])
                    setPendingTransaction(parsed) // Store draft
                    return;
                }

                if (parsed.status === 'needs_confirmation') {
                    // Confirm Installments
                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Entendi: ${parsed.description} de R$${parsed.installmentTotal?.toFixed(2)} parcelado em ${parsed.installments}x.\n\nA parcela será de R$${parsed.amount.toFixed(2)}. Posso registrar a primeira parcela?`,
                        createdAt: new Date()
                    }
                    setMessages(prev => [...prev, aiResponse])
                    setPendingTransaction(parsed) // Store draft
                    return;
                }

                // 3. Smart Check: High Value OR Installments & Unknown Payment Method
                const needsPayment = (!parsed.paymentMethod || parsed.paymentMethod === 'unknown');
                const isHighValue = parsed.amount > 100;
                const hasInstallments = !!parsed.installments;

                if (parsed.type === 'expense' && needsPayment && (isHighValue || hasInstallments)) {
                    let question = `Valor de R$${parsed.amount.toFixed(2)}. Foi à vista, Pix ou parcelado?`;

                    if (hasInstallments) {
                        question = `Entendi que é em ${parsed.installments}x. Foi no Cartão de Crédito?`;
                    }

                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: question,
                        createdAt: new Date()
                    };
                    setMessages(prev => [...prev, aiResponse]);
                    // Mark draft as needing details
                    parsed.status = 'needs_details';
                    setPendingTransaction(parsed);
                    return;
                }

                // Success immediately
                await saveTransaction(parsed);

            } else {
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Não entendi muito bem. Tente falar algo como 'Almoço 15' ou 'Uber 20'.",
                    createdAt: new Date()
                }
                setMessages(prev => [...prev, aiResponse])
            }

        } catch (error) {
            console.error(error)
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Desculpe, tive um erro ao processar. Tente novamente.",
                createdAt: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
        } finally {
            setIsSending(false)
        }
    }

    const handlePendingState = async (content: string) => {
        if (!pendingTransaction) return;

        // Clone pending
        const draft = { ...pendingTransaction };
        const lower = content.toLowerCase();

        // CASE 1: Missing Amount
        if (draft.status === 'missing_amount') {
            // User input should be the amount
            const amountMatch = content.match(/(\d+[.,]?\d*)/);
            if (amountMatch) {
                const amountStr = amountMatch[1].replace(',', '.');
                draft.amount = parseFloat(amountStr);
                draft.status = 'success'; // Assume success initially

                // NEW: Also check for Payment Method in this answer
                // Since we asked "Quanto foi e COMO pagou?", user likely said "20 no credito"
                const paymentCheck = parseMessage(content);
                if (paymentCheck?.paymentMethod && paymentCheck.paymentMethod !== 'unknown') {
                    draft.paymentMethod = paymentCheck.paymentMethod;
                }

                // RE-CHECK High Value Logic logic here for flow continuity
                // Check if we still need payment info
                const needsPayment = (!draft.paymentMethod || draft.paymentMethod === 'unknown');
                const isHighValue = draft.amount > 100;

                // Note: We don't check hasInstallments here because usually missing_amount flow handles simple inputs, 
                // but strictly following logic:
                if (draft.type === 'expense' && needsPayment && isHighValue) {
                    // ... existing logic asking for method ...
                    // For brevity, let's reuse generic check or just proceed if simple.
                    // Let's keep the existing logic block for flow consistency:

                    const lower = content.toLowerCase();
                    let hasPaymentInfo = draft.paymentMethod && draft.paymentMethod !== 'unknown';
                    // Fallback check keyword
                    if (!hasPaymentInfo && ['pix', 'credito', 'creidto', 'debito', 'parcelado', 'vezes', 'x'].some(k => lower.includes(k))) hasPaymentInfo = true;

                    if (!hasPaymentInfo) {
                        const aiResponse: Message = {
                            id: (Date.now() + 1).toString(),
                            role: "assistant",
                            content: `Certo, R$${draft.amount.toFixed(2)}. Foi à vista, Pix ou parcelado?`,
                            createdAt: new Date()
                        };
                        setMessages(prev => [...prev, aiResponse]);
                        draft.status = 'needs_details';
                        setPendingTransaction(draft);
                        return;
                    }
                }

                // Clear pending and save
                setPendingTransaction(null);
                await saveTransaction(draft);
            } else {
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Ainda não captei o valor. Digite apenas o número, ex: '50'.",
                    createdAt: new Date()
                }
                setMessages(prev => [...prev, aiResponse])
            }
            return;
        }

        // CASE 2: Needs Details (Payment Method / Installments)
        if (draft.status === 'needs_details') {
            // 1. Try to detect Payment Method from Answer
            const paymentCheck = parseMessage(content);
            if (paymentCheck?.paymentMethod && paymentCheck.paymentMethod !== 'unknown') {
                draft.paymentMethod = paymentCheck.paymentMethod;
            } else {
                // Manual keywords if parser failed (e.g. "sim" for credit context)
                if (lower.includes('sim') && draft.installments) {
                    draft.paymentMethod = 'credit';
                }
            }

            // 2. Check for Installments updating (e.g. "Ah foi em 10x")
            const installmentMatch = lower.match(/(?:em\s+)?(\d+)\s*x|(?:em\s+)(\d+)\s*vezes/);
            if (installmentMatch || lower.includes('parcelado')) {
                let installments = 1;
                if (installmentMatch) {
                    installments = parseInt(installmentMatch[1] || installmentMatch[2]);
                }

                // If they provided installments now
                if (installments > 1) {
                    draft.installmentTotal = draft.amount;
                    draft.installments = installments;
                    draft.amount = draft.amount / installments;
                    draft.description = `${draft.description} (1/${installments})`;
                    // We probably have payment method 'credit' implied if not set?
                    if (!draft.paymentMethod || draft.paymentMethod === 'unknown') draft.paymentMethod = 'credit';

                    // Confirm
                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Entendi: ${installments}x de R$${draft.amount.toFixed(2)}. Posso registrar?`,
                        createdAt: new Date()
                    };
                    setMessages(prev => [...prev, aiResponse]);
                    draft.status = 'needs_confirmation';
                    setPendingTransaction(draft);
                    return;
                } else if (!draft.installments) {
                    // Said parcelado but no number?
                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: "Parcelado em quantas vezes? (ex: 10x)",
                        createdAt: new Date()
                    };
                    setMessages(prev => [...prev, aiResponse]);
                    return;
                }
            }

            // If we have payment method now (or user said "Sim" to "Foi credito?"), save.
            if (draft.paymentMethod && draft.paymentMethod !== 'unknown') {
                draft.status = 'success';
                setPendingTransaction(null);
                await saveTransaction(draft);
                return;
            }

            // If still unknown, maybe they said "Pix"? (Covered by parseMessage above)
            // If fallback
            draft.status = 'success';
            setPendingTransaction(null);
            await saveTransaction(draft);
            return;
        }

        // CASE 3: Confirmation (Final Step)
        if (draft.status === 'needs_confirmation') {
            if (['sim', 'yes', 'pode', 'claro', 'ok', 'confirmar'].some(k => lower.includes(k))) {
                draft.status = 'success';
                // Append installment info here if not present
                if (draft.installments && !draft.description.includes('(1/')) {
                    draft.description = `${draft.description} (1/${draft.installments})`;
                }
                setPendingTransaction(null);
                await saveTransaction(draft);
            } else {
                // Cancel
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Ok, cancelado. Pode digitar novamente se quiser.",
                    createdAt: new Date()
                }
                setMessages(prev => [...prev, aiResponse])
                setPendingTransaction(null);
            }
            return;
        }
    }

    const saveTransaction = async (parsed: ParsedTransaction) => {

        // Append Payment Method Tag if exists and not already there
        // Used for "Professional Badge" rendering in TransactionItem
        let finalDescription = parsed.description;
        if (parsed.paymentMethod && parsed.paymentMethod !== 'unknown' && !finalDescription.includes('[')) {
            let tag = '';
            switch (parsed.paymentMethod) {
                case 'pix': tag = '[Pix]'; break;
                case 'credit': tag = '[Crédito]'; break;
                case 'debit': tag = '[Débito]'; break;
                case 'cash': tag = '[Dinheiro]'; break;
                case 'trust': tag = '[Confiança 🤝]'; break;
            }
            if (tag) finalDescription = `${finalDescription} ${tag}`;
        }

        // Add to database
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: parsed.type,
                amount: parsed.amount,
                category: parsed.category,
                description: finalDescription,
                date: parsed.date.toISOString(),
                brand: parsed.brand,
                brandLogo: parsed.brandLogo,
                installments: parsed.installments,
            }),
        });

        if (!response.ok) throw new Error('Failed to save transaction');

        const successMessage = parsed.type === 'income'
            ? t.transactions.successfullyUpdated || "Income added!"
            : t.transactions.successfullyUpdated || "Expense added!";

        const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ ${successMessage}: ${parsed.description} - $${parsed.amount.toFixed(2)}`,
            createdAt: new Date()
        }
        setMessages(prev => [...prev, aiResponse])
    }


    return (
        <div className="flex flex-col h-[100dvh] md:h-full bg-background relative overflow-hidden fixed inset-0 md:static md:inset-auto z-10">
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6 scroll-smooth pb-24 md:pb-32 pt-2">
                {messages.length === 0 ? (
                    <div className="min-h-full flex flex-col items-center justify-start pt-8 p-3 md:p-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 md:mb-6 ring-1 ring-primary/20 shadow-lg shadow-primary/10 shrink-0 animate-[float_6s_ease-in-out_infinite]">
                            <span className="text-2xl md:text-3xl animate-[pulse_2s_ease-in-out_infinite]">✨</span>
                        </div>

                        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent text-center mb-1 md:mb-2">
                            {t.chat.welcome}
                        </h2>

                        <p className="text-muted-foreground text-center max-w-sm mb-4 md:mb-8 text-xs md:text-base leading-relaxed">
                            {t.chat.description}
                        </p>

                        <div className="w-full max-w-2xl grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 pb-8">
                            {/* Expense Examples */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-rose-500 uppercase tracking-wider text-center md:text-left pl-1">
                                    {t.chat.actions?.expense || "Expenses"}
                                </h3>
                                <div className="space-y-2">
                                    {t.chat.examples.expense.map((example: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(example)}
                                            style={{ animationDelay: `${i * 80}ms` }}
                                            className="w-full text-left p-3 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-rose-500/5 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 text-sm text-muted-foreground hover:text-foreground flex items-center gap-3 group active:scale-[0.98] touch-manipulation animate-in fade-in slide-in-from-left-2"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-500/5 flex items-center justify-center text-rose-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0">
                                                <ArrowDownCircle className="w-4 h-4" />
                                            </div>
                                            <span className="truncate group-hover:translate-x-0.5 transition-transform duration-300">{example}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Income Examples */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider text-center md:text-left pl-1">
                                    {t.chat.actions?.income || "Income"}
                                </h3>
                                <div className="space-y-2">
                                    {t.chat.examples.income.map((example: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(example)}
                                            style={{ animationDelay: `${(i + 4) * 80}ms` }}
                                            className="w-full text-left p-3 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-emerald-500/5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 text-sm text-muted-foreground hover:text-foreground flex items-center gap-3 group active:scale-[0.98] touch-manipulation animate-in fade-in slide-in-from-right-2"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shrink-0">
                                                <ArrowUpCircle className="w-4 h-4" />
                                            </div>
                                            <span className="truncate group-hover:translate-x-0.5 transition-transform duration-300">{example}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                )}
                {isSending && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-muted rounded-2xl p-4 rounded-tl-none">
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-2 px-3 rounded-lg">
                                {/* Use simple dot animation or text */}
                                <span className="animate-pulse">...</span>
                            </p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="pb-4" />
            </div>

            <div className="fixed bottom-0 left-0 right-0 md:pl-72 p-4 bg-gradient-to-t from-background via-background/95 to-transparent z-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSend={handleSendMessage} disabled={isSending} />
                </div>
            </div>
        </div>
    )
}
