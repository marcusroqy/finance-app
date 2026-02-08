"use client"

import * as React from "react"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

import { ChatInput } from "./ChatInput"
import { ChatMessage, Message, MessageOption } from "./ChatMessage"
import { parseMessage, ParsedTransaction } from "@/lib/parser"
import { useLanguage } from "@/lib/i18n/language-context"

export function ChatContainer() {

    const { t } = useLanguage()
    const [messages, setMessages] = React.useState<Message[]>([])
    const [isSending, setIsSending] = React.useState(false)
    const [pendingTransaction, setPendingTransaction] = React.useState<ParsedTransaction | null>(null)
    const [cards, setCards] = React.useState<any[]>([]) // Store user cards
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch cards on mount
    React.useEffect(() => {
        fetch('/api/credit-cards')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCards(data);
            })
            .catch(err => console.error("Failed to fetch cards", err));
    }, []);

    const handleOptionClick = async (option: MessageOption) => {
        if (!pendingTransaction) return;

        // Handle Card Selection
        if (option.action === 'select-card') {
            const draft = { ...pendingTransaction };
            draft.cardId = option.value;
            draft.paymentMethod = 'credit';

            // CHECK: If High Value (> 100) and no installments info yet, ASK!
            if (draft.amount > 100 && !draft.installments) {
                draft.status = 'needs_details';

                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `Beleza, ${option.label.split('•')[0].trim()}. Foi à vista ou parcelado?`,
                    createdAt: new Date()
                };

                addUserMessage(option.label);
                setMessages(prev => [...prev, aiResponse]);
                setPendingTransaction(draft);
                return;
            }

            draft.status = 'success';

            // Add user message to simulate selection
            addUserMessage(option.label);

            setPendingTransaction(null);
            await saveTransaction(draft);
        } else if (option.action === 'select-method' && option.value === 'other_method') {
            // User excluded credit cards
            const draft = { ...pendingTransaction };

            // Now ask for specific method if unknown
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Ah, tranquilo. Foi no Pix, Débito ou Dinheiro?",
                createdAt: new Date()
            };

            addUserMessage(option.label);
            setMessages(prev => [...prev, aiResponse]);

            // Update status so next text input is processed as payment method
            draft.status = 'needs_details';
            draft.paymentMethod = 'unknown'; // Force ask
            setPendingTransaction(draft);
        } else if (option.action === 'confirm-payment') {
            const transactionId = option.value;
            addUserMessage(option.label);

            try {
                // We use the amount from pendingTransaction if available (user might have said "paid 150" for a 200 bill)
                const body: any = { status: 'paid' };
                if (pendingTransaction && pendingTransaction.amount) {
                    body.amount = pendingTransaction.amount;
                }

                const res = await fetch(`/api/transactions/${transactionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) throw new Error("Failed to update");

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "✅ Conta paga com sucesso! 🎉",
                    createdAt: new Date()
                }]);
                setPendingTransaction(null);
            } catch (error) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "❌ Erro ao atualizar conta. Tente novamente.",
                    createdAt: new Date()
                }]);
            }
        }
    }

    const addUserMessage = (text: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            createdAt: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
    }

    const handleSendMessage = async (content: string, image?: string) => {
        if (!content.trim() && !image) return

        // Add User Message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content,
            image: image,
            createdAt: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setIsSending(true)

        try {
            // AI Processing with Context
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    image,
                    context: pendingTransaction // SEND CONTEXT!
                }),
            });

            const parsed = await response.json();

            if (!response.ok) {
                // If it's a safety/length error, show response_message
                if (parsed.response_message) {
                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: parsed.response_message,
                        createdAt: new Date()
                    }
                    setMessages(prev => [...prev, aiResponse])
                    setIsSending(false)
                    return;
                }
                throw new Error(parsed.error || "AI request failed");
            }

            // Handle Error from API
            if (parsed.error) {
                // If it's a safety/length error, show response_message
                if (parsed.response_message) {
                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: parsed.response_message,
                        createdAt: new Date()
                    }
                    setMessages(prev => [...prev, aiResponse])
                    setIsSending(false)
                    return;
                }
                throw new Error(parsed.error);
            }

            // 1. Display AI Response (The Question or Confirmation)
            // The AI now ALWAYS returns a response_message (defined in prompt)
            if (parsed.response_message) {
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: parsed.response_message,
                    createdAt: new Date()
                }

                // If Action is PAY_BILL, add confirmation options immediately
                if (parsed.action === 'pay_bill' && parsed.transactionId) {
                    aiResponse.options = [
                        { label: "✅ Sim, Pagar", value: parsed.transactionId, action: "confirm-payment" },
                        { label: "❌ Não, Cancelar", value: "cancel", action: "cancel" }
                    ];
                    // Clean pending state so we don't double process?
                    // Actually we might need it for amount confirmation.
                    setPendingTransaction(parsed);
                }

                setMessages(prev => [...prev, aiResponse])
            }

            // 2. Handle Status
            if (parsed.status === 'success') {
                // Check if we need to ask for Card (for Credit)
                // The AI might have asked "How did you pay?", user said "Credit".
                // Now we have method=credit but maybe no cardId.
                if (parsed.paymentMethod === 'credit' && !parsed.cardId && cards.length > 0) {
                    const aiResponse: Message = {
                        id: (Date.now() + 2).toString(),
                        role: "assistant",
                        content: "Qual cartão você usou?",
                        options: cards.map(c => ({
                            label: `${c.name} • ${c.last4}`,
                            value: c.id,
                            action: 'select-card'
                        })),
                        createdAt: new Date()
                    }
                    setMessages(prev => [...prev, aiResponse])
                    parsed.status = 'needs_details'; // Hold success to get card
                    setPendingTransaction(parsed);
                    return;
                }

                setPendingTransaction(null);
                await saveTransaction(parsed);
            } else {
                // needs_details: The AI already asked the question in response_message.
                // We just update the state.
                setPendingTransaction(parsed);
            }

        } catch (error: any) {
            console.error("AI Error:", error)
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `❌ Erro de Conexão: ${error.message || "Tente novamente."}`,
                createdAt: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
        } finally {
            setIsSending(false)
        }
    }

    // handlePendingState is now mostly for Option Clicks or niche fallbacks
    // We can simplifying it or keep it for the "Option Click" flow which calls it?
    // Actually handleOptionClick calls saveTransaction or logic directly. 
    // We can remove handlePendingState distinct call from handleSendMessage logic above.


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

        // Check for Inline New Card Registration 🆕
        if (parsed.newCard) {
            const tempId = (Date.now() + 2).toString();
            setMessages(prev => [...prev, {
                id: tempId,
                role: "assistant",
                content: `💳 Cadastrando cartão **${parsed.newCard?.name}**...`,
                createdAt: new Date()
            }]);

            try {
                const cardRes = await fetch('/api/credit-cards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsed.newCard)
                });

                if (cardRes.ok) {
                    const newCardData = await cardRes.json();
                    parsed.cardId = newCardData.id;
                    // Remove temp message or update it? Let's just append success
                    const successMsg: Message = {
                        id: (Date.now() + 3).toString(),
                        role: "assistant",
                        content: `✅ Cartão cadastrado com sucesso!`,
                        createdAt: new Date()
                    };
                    setMessages(prev => [...prev, successMsg]);

                    // Refresh local cards list so next time AI knows about it
                    setCards(prev => [newCardData, ...prev]);
                } else {
                    console.error("Failed to create card");
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 3).toString(),
                        role: "assistant",
                        content: `⚠️ Não consegui cadastrar o cartão. Vou salvar sem vínculo.`,
                        createdAt: new Date()
                    }]);
                }
            } catch (err) {
                console.error("Error creating card:", err);
            }
        }

        // Add to database
        const payload = {
            type: parsed.type,
            amount: parsed.amount,
            category: parsed.category,
            description: finalDescription,
            date: !parsed.date || isNaN(new Date(parsed.date).getTime()) ? new Date().toISOString() : new Date(parsed.date).toISOString(),
            brand: parsed.brand,
            brandLogo: parsed.brandLogo,
            installments: parsed.installments,
            cardId: parsed.cardId,
            isRecurring: parsed.isRecurring,
            recurringDay: parsed.recurringDay,
        };

        console.log("Saving Transaction Payload:", payload);

        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Save Transaction Failed:", errorText);
            throw new Error('Failed to save transaction: ' + errorText);
        }

        let successMessage = parsed.type === 'income'
            ? t.transactions.successfullyUpdated || "Income added!"
            : t.transactions.successfullyUpdated || "Expense added!";

        if (parsed.isRecurring) {
            successMessage = "Agendado recorrente! 🔄";
        }

        const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ ${successMessage}: ${parsed.description} - $${(parsed.amount || 0).toFixed(2)}`,
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
                        <ChatMessage key={msg.id} message={msg} onOptionClick={handleOptionClick} />
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
