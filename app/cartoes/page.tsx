"use client"

// React & Hooks
import { useState, useMemo } from "react"

// Componentes Globais
import { DemoBanner } from "@/components/demo-banner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Contexto e Serviços
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/services"

// Ícones
import { CreditCard as CardIcon, Plus, Search, ArrowUpDown } from "lucide-react"

// Tipos
import type { CreditCard, CardExpense } from "@/lib/types"

// Hook de Negócio (projeção, limite real, mês selecionado)
import { useCardProjection } from "./hooks/useCardProjection"

// Subcomponentes Atômicos
import { CreditCardStack } from "./components/CreditCardStack"
import { ExpenseTable } from "./components/ExpenseTable"
import { InvoiceProjection } from "./components/InvoiceProjection"
import { CardDialogs } from "./components/CardDialogs"

// ─── Formulários Vazios ───────────────────────────────────────────────────────

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
    cardId: 0,
}

// ─── Página de Cartões ────────────────────────────────────────────────────────

/**
 * Página de Cartões de Crédito.
 *
 * Responsável pela composição de UI. Lógica de projeção de faturas,
 * cálculo de limite disponível real e seleção de mês estão em `useCardProjection`.
 */
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
    const { toast } = useToast()

    // ── Estado de UI ──────────────────────────────────────────────────────────

    const [activeCardId, setActiveCardId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [cardDialogOpen, setCardDialogOpen] = useState(false)
    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
    const [editingCardId, setEditingCardId] = useState<number | null>(null)
    const [cardForm, setCardForm] = useState(emptyCardForm)
    const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [cardToDelete, setCardToDelete] = useState<number | null>(null)

    // ── Hook de Negócio ───────────────────────────────────────────────────────

    const {
        projectionData,
        selectedMonthIndex,
        setSelectedMonthIndex,
        getCardAvailableLimit,
        getBankByIdSafe,
    } = useCardProjection()

    // ── Dados Derivados ───────────────────────────────────────────────────────

    const activeCard = useMemo(() =>
        creditCards.find(c => c.id === (activeCardId || creditCards[0]?.id)),
        [creditCards, activeCardId]
    )

    const activeExpenses = useMemo(() => {
        let filtered = cardExpenses
        if (activeCardId !== null && activeCardId !== 0) {
            filtered = filtered.filter(e => e.cardId === activeCardId)
        }
        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return filtered.sort((a, b) =>
            sortOrder === "desc" ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount
        )
    }, [cardExpenses, activeCardId, searchTerm, sortOrder])

    // ── Handlers ──────────────────────────────────────────────────────────────

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
            addCardExpense({ ...expenseForm, cardId: activeCard.id })
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
            bankId: card.bankId ?? 0,
            limit: card.limit,
            closingDay: card.closingDay,
            dueDay: card.dueDay,
            color: card.color,
        })
        setCardDialogOpen(true)
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background transition-theme pb-20 sm:pb-0">
            <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CardIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight italic uppercase">Cartões</h2>
                    </div>
                </div>
            </header>

            <DemoBanner />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                {/* Stack de Cartões */}
                <section>
                    <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Meus Cartões</h3>
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => { setEditingCardId(null); setCardForm(emptyCardForm); setCardDialogOpen(true) }}
                            className="text-primary hover:text-primary hover:bg-primary/10 font-bold uppercase tracking-tighter text-[10px]"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Adicionar Cartão
                        </Button>
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
                        {/* Histórico de Gastos */}
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                    Histórico de Gastos
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar despesa..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 h-8 text-xs w-[180px] bg-card"
                                        />
                                    </div>
                                    <select
                                        value={activeCardId ?? 0}
                                        onChange={(e) => setActiveCardId(parseInt(e.target.value))}
                                        className="bg-card text-xs font-bold text-primary border border-border rounded-md px-2 h-8 cursor-pointer focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value={0}>Todos os Cartões</option>
                                        {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                        className="h-8 text-[10px] font-bold uppercase tracking-tighter"
                                    >
                                        <ArrowUpDown className="w-3 h-3 mr-1" /> Valor
                                    </Button>
                                </div>
                            </div>
                            <ExpenseTable
                                expenses={activeExpenses}
                                onDeleteExpense={deleteCardExpense}
                                formatCurrency={formatCurrency}
                                isPrivate={settings.isPrivate ?? false}
                            />
                        </section>
                    </div>

                    {/* Projeção de Faturas com seleção de mês sincronizada (fix B1) */}
                    <div className="xl:col-span-3">
                        <InvoiceProjection
                            data={projectionData}
                            selectedMonthIndex={selectedMonthIndex}
                            onMonthSelect={setSelectedMonthIndex}
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
                categories={[]}
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
