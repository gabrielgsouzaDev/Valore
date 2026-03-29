"use client"

import { useState, useMemo } from "react"
import { DemoBanner } from "@/components/demo-banner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CreditCard as CardIcon } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { CreditCard, CardExpense } from "@/lib/types"

import { BUSINESS_RULES } from "@/lib/business-constants"

// Local Atomic Components
import { CreditCardStack } from "./components/CreditCardStack"
import { ExpenseTable } from "./components/ExpenseTable"
import { InvoiceProjection } from "./components/InvoiceProjection"
import { CardDialogs } from "./components/CardDialogs"

const emptyCardForm = {
    name: "",
    bankId: 0,
    limit: 0,
    closingDay: 1,
    dueDay: 1,
    color: "blue",
}

const emptyExpenseForm = {
    description: "",
    totalAmount: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    installments: 1,
}

export default function CartoesPage() {
    const {
        creditCards,
        cardExpenses,
        banks,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        addCardExpense,
        deleteCardExpense,
        settings,
    } = useApp()

    const [activeCardId, setActiveCardId] = useState<number | null>(null)
    const [cardDialogOpen, setCardDialogOpen] = useState(false)
    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
    const [editingCardId, setEditingCardId] = useState<number | null>(null)
    const [cardForm, setCardForm] = useState(emptyCardForm)
    const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [cardToDelete, setCardToDelete] = useState<number | null>(null)
    const { toast } = useToast()

    // ── LOGIC: Projections & Lists ────────────────────────────────
    const activeCard = useMemo(() =>
        creditCards.find(c => c.id === (activeCardId || creditCards[0]?.id)),
        [creditCards, activeCardId]
    )

    const activeExpenses = useMemo(() =>
        cardExpenses.filter(e => e.cardId === (activeCard?.id || 0))
            .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()),
        [cardExpenses, activeCard]
    )

    const getCardAvailableLimit = (card: CreditCard) => {
        const used = cardExpenses
            .filter(e => e.cardId === card.id)
            .reduce((sum, e) => sum + e.totalAmount, 0)
        return Math.max(0, card.limit - used)
    }

    const projectionData = useMemo(() => {
        const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        const data = Array.from({ length: BUSINESS_RULES.INVOICE_PROJECTION_MONTHS }).map((_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() + i)
            const month = date.getMonth()
            const year = date.getFullYear()

            const total = cardExpenses.reduce((sum, e) => {
                const expenseDate = new Date(e.purchaseDate)
                const startMonth = expenseDate.getMonth()
                const startYear = expenseDate.getFullYear()
                
                const monthsDiff = (year - startYear) * 12 + (month - startMonth)
                if (monthsDiff >= 0 && monthsDiff < e.installments) {
                    return sum + (e.totalAmount / e.installments)
                }
                return sum
            }, 0)

            return {
                name: `${monthsNames[month]}`,
                total: total
            }
        })
        return data
    }, [cardExpenses])

    // ── HANDLERS ──────────────────────────────────────────────────
    const handleCardSubmit = async () => {
        if (!cardForm.name || !cardForm.bankId) return
        setIsSubmitting(true)
        try {
            await new Promise(r => setTimeout(r, 600))
            if (editingCardId) {
                updateCreditCard(editingCardId, cardForm)
                toast({ title: "Cartão atualizado" })
            } else {
                addCreditCard(cardForm)
                toast({ title: "Cartão adicionado" })
            }
            setCardDialogOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleExpenseSubmit = async () => {
        if (!expenseForm.description || !expenseForm.totalAmount || !activeCard) return
        setIsSubmitting(true)
        try {
            await new Promise(r => setTimeout(r, 400))
            addCardExpense({
                ...expenseForm,
                cardId: activeCard.id,
            })
            toast({ title: "Gasto adicionado" })
            setExpenseDialogOpen(false)
            setExpenseForm(emptyExpenseForm)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCard = (id: number) => {
        setCardToDelete(id)
        setConfirmOpen(true)
    }

    const openEditCard = (card: CreditCard) => {
        setEditingCardId(card.id)
        setCardForm({
            name: card.name,
            bankId: card.bankId || 0,
            limit: card.limit,
            closingDay: card.closingDay,
            dueDay: card.dueDay,
            color: card.color,
        })
        setCardDialogOpen(true)
    }

    const getBankByIdSafe = (id: number) => banks.find(b => b.id === id)
    const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)

    return (
        <div className="min-h-screen bg-background transition-theme pb-20 sm:pb-0">
            <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CardIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        <div>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight italic uppercase">Cartões</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80 italic lowercase tracking-wider">Gestão de Crédito • Faturas</p>
                        </div>
                    </div>
                </div>
            </header>

            <DemoBanner />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Meus Cartões</h3>
                    </div>
                    <CreditCardStack
                        creditCards={creditCards}
                        onEditCard={openEditCard}
                        onDeleteCard={handleDeleteCard}
                        onAddExpense={(id) => {
                            if (id === 0) {
                                setEditingCardId(null)
                                setCardForm(emptyCardForm)
                                setCardDialogOpen(true)
                            } else {
                                setActiveCardId(id)
                                setExpenseDialogOpen(true)
                            }
                        }}
                        getBankById={getBankByIdSafe}
                        formatCurrency={formatCurrency}
                        getCardAvailableLimit={getCardAvailableLimit}
                    />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                    Histórico de Gastos {activeCard && `• ${activeCard.name}`}
                                </h3>
                                {activeCard && (
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={activeCard.id} 
                                            onChange={(e) => setActiveCardId(parseInt(e.target.value))}
                                            className="bg-transparent text-xs font-bold text-primary border-none focus:ring-0 cursor-pointer"
                                        >
                                            {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <ExpenseTable
                                expenses={activeExpenses}
                                onDeleteExpense={deleteCardExpense}
                                formatCurrency={formatCurrency}
                                isPrivate={settings.isPrivate || false}
                            />
                        </section>
                    </div>

                    <div className="space-y-6">
                        <InvoiceProjection
                            data={projectionData}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                </div>
            </main>

            <CardDialogs
                cardDialogOpen={cardDialogOpen}
                setCardDialogOpen={setCardDialogOpen}
                cardForm={cardForm}
                setCardForm={setCardForm}
                editingCardId={editingCardId}
                banks={banks}
                onCardSubmit={handleCardSubmit}
                expenseDialogOpen={expenseDialogOpen}
                setExpenseDialogOpen={setExpenseDialogOpen}
                expenseForm={expenseForm}
                setExpenseForm={setExpenseForm}
                categories={[]} // Not used anymore in expenses
                onExpenseSubmit={handleExpenseSubmit}
                isSubmitting={isSubmitting}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Excluir Cartão?"
                description="Tem certeza? Todos os gastos vinculados a este cartão também serão removidos."
                onConfirm={() => {
                    if (cardToDelete) {
                        deleteCreditCard(cardToDelete)
                        toast({ title: "Cartão removido" })
                    }
                    setConfirmOpen(false)
                }}
            />
        </div>
    )
}
