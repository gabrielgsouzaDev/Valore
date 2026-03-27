"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
import { useApp } from "@/contexts/app-context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import type { CreditCard as CreditCardType, CardExpense } from "@/lib/types"
import {
  Plus,
  CreditCard,
  Pencil,
  Trash2,
  Calendar,
  TrendingDown,
  Receipt,
  ShoppingCart,
  Sparkles,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const cardColors = [
  { value: "violet", label: "Roxo", class: "from-violet-600 to-violet-800" },
  { value: "orange", label: "Laranja", class: "from-orange-500 to-orange-700" },
  { value: "emerald", label: "Verde", class: "from-emerald-500 to-emerald-700" },
  { value: "blue", label: "Azul Marine", class: "from-blue-600 to-blue-900" },
  { value: "rose", label: "Rosa", class: "from-rose-500 to-rose-700" },
  { value: "cyan", label: "Ciano", class: "from-cyan-500 to-cyan-700" },
  { value: "amber", label: "Gold Premium", class: "from-amber-400 via-amber-600 to-amber-700" },
  { value: "slate", label: "Silver Metal", class: "from-slate-300 via-slate-500 to-slate-600" },
  { value: "zinc", label: "Obsidian Black", class: "from-zinc-800 via-zinc-900 to-black" },
  { value: "indigo", label: "Indigo Deep", class: "from-indigo-600 to-indigo-900" },
]

const CardChip = () => (
  <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 relative overflow-hidden border border-white/20 shadow-inner">
    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-30">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="border-[0.5px] border-black/40" />
      ))}
    </div>
    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20" />
    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/20" />
  </div>
)

const ContactlessIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.06 16.5a.5.5 0 01-.1-.7 7 7 0 010-9.6.5.5 0 11.7.7 6 6 0 000 8.2.5.5 0 01-.6.7zm2.47-1.41a.5.5 0 01-.06-.7 5 5 0 010-6.78.5.5 0 11.7.7 4 4 0 000 5.38.5.5 0 01-.64.7zm2.48-1.42a.5.5 0 01-.02-.7 3 3 0 010-3.94.5.5 0 11.71.7 2 2 0 000 2.54.5.5 0 01-.69.7zM15 12a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
)

const getColorClass = (color: string) => {
  return cardColors.find((c) => c.value === color)?.class || "from-slate-600 to-slate-800"
}

export default function CartoesPage() {
  const {
    creditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    cardExpenses,
    addCardExpense,
    updateCardExpense,
    deleteCardExpense,
    calculateInvoices,
    getTotalCardDebt,
    getCardAvailableLimit,
    settings,
    banks,
    getBankById,
  } = useApp()

  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null)
  const [editingExpense, setEditingExpense] = useState<CardExpense | null>(null)
  const [expandedInvoice, setExpandedInvoice] = useState<number | null>(null)

  const [cardForm, setCardForm] = useState({
    name: "",
    limit: 0,
    closingDay: 1,
    dueDay: 10,
    color: "violet",
    bankId: undefined as number | undefined,
  })

  const [expenseForm, setExpenseForm] = useState({
    cardId: 0,
    description: "",
    totalAmount: 0,
    installments: 1,
    purchaseDate: new Date().toISOString().split("T")[0],
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "card" | "expense", id: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const totalDebt = getTotalCardDebt()
  const invoices = calculateInvoices()
  const currentMonthInvoice = invoices[0]?.total || 0
  const nextMonthInvoice = invoices[1]?.total || 0

  const openAddCardDialog = () => {
    setEditingCard(null)
    setCardForm({ name: "", limit: 0, closingDay: 1, dueDay: 10, color: "violet", bankId: undefined })
    setCardDialogOpen(true)
  }

  const openEditCardDialog = (card: CreditCardType) => {
    setEditingCard(card)
    setCardForm({
      name: card.name,
      limit: card.limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      color: card.color,
      bankId: card.bankId,
    })
    setCardDialogOpen(true)
  }

  const handleSaveCard = async () => {
    if (!cardForm.name || cardForm.limit <= 0) return
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 300))
    if (editingCard) {
      updateCreditCard(editingCard.id, cardForm)
      toast({ title: "Cartão atualizado" })
    } else {
      addCreditCard(cardForm)
      toast({ title: "Cartão adicionado" })
    }
    setIsSubmitting(false)
    setCardDialogOpen(false)
  }

  const handleDeleteCard = (id: number) => {
    setDeleteTarget({ type: "card", id })
    setConfirmOpen(true)
  }

  const openAddExpenseDialog = (cardId?: number) => {
    setEditingExpense(null)
    setExpenseForm({
      cardId: cardId || creditCards[0]?.id || 0,
      description: "",
      totalAmount: 0,
      installments: 1,
      purchaseDate: new Date().toISOString().split("T")[0],
    })
    setExpenseDialogOpen(true)
  }

  const openEditExpenseDialog = (expense: CardExpense) => {
    setEditingExpense(expense)
    setExpenseForm({
      cardId: expense.cardId,
      description: expense.description,
      totalAmount: expense.totalAmount,
      installments: expense.installments,
      purchaseDate: expense.purchaseDate,
    })
    setExpenseDialogOpen(true)
  }

  const handleSaveExpense = async () => {
    if (!expenseForm.description || expenseForm.totalAmount <= 0 || !expenseForm.cardId) return
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 300))
    if (editingExpense) {
      updateCardExpense(editingExpense.id, expenseForm)
      toast({ title: "Despesa atualizada" })
    } else {
      addCardExpense(expenseForm)
      toast({ title: "Despesa adicionada" })
    }
    setIsSubmitting(false)
    setExpenseDialogOpen(false)
  }

  const handleDeleteExpense = (id: number) => {
    setDeleteTarget({ type: "expense", id })
    setConfirmOpen(true)
  }

  const getBestDayToBuy = (card: CreditCardType) => {
    const today = new Date().getDate()
    if (today >= card.closingDay) {
      return `Compre apos dia ${card.closingDay} para a fatura do proximo mes`
    }
    return `Compre antes do dia ${card.closingDay} para entrar na fatura atual`
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <>
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <div className="flex flex-col justify-center">
              <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Cartões</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">
                Gestão de crédito • Projeção de parcelas
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Dívida Total</p>
            <p className={cn("text-xl sm:text-3xl font-bold tracking-tight",
              totalDebt > 0 ? "text-danger" : "text-success",
              settings.isPrivate && "blur-xl select-none pointer-events-none opacity-40"
            )}>
              {formatCurrency(totalDebt)}
            </p>
          </div>
        </div>
      </header>
      <DemoBanner />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-card border-border p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Cartões</p>
                <p className="text-sm sm:text-xl font-bold text-foreground">{creditCards.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-danger/10 flex-shrink-0">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Fatura Atual</p>
                <p className={cn("text-sm sm:text-xl font-bold text-danger", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                  {formatCurrency(currentMonthInvoice)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10 flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Próxima Fatura</p>
                <p className={cn("text-sm sm:text-xl font-bold text-warning", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                  {formatCurrency(nextMonthInvoice)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 flex-shrink-0">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Parcelas</p>
                <p className="text-sm sm:text-xl font-bold text-accent">{cardExpenses.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Credit Cards */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-semibold text-foreground">Meus Cartões</h3>
              <Button
                onClick={openAddCardDialog}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Novo Cartão</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {creditCards.map((card) => {
                const available = getCardAvailableLimit(card.id)
                const used = card.limit - available
                const usedPercent = (used / card.limit) * 100
                const bank = card.bankId ? getBankById(card.bankId) : null

                return (
                  <div
                    key={card.id}
                    className={cn(
                      "relative rounded-2xl p-5 sm:p-7 bg-gradient-to-br text-white overflow-hidden shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group/card",
                      getColorClass(card.color),
                    )}
                  >
                    {/* Realistic Card Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <CardChip />
                        <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-foreground/80 hover:bg-white/10 transition-colors duration-150 rounded-md"
                            onClick={() => openEditCardDialog(card)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-foreground/80 hover:bg-white/10 transition-colors duration-150 rounded-md"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h4 className="text-xl sm:text-2xl font-bold tracking-widest mb-1 truncate uppercase">
                          {card.name}
                        </h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-mono opacity-60 tracking-[0.2em]">•••• •••• •••• 4022</p>
                          <ContactlessIcon />
                        </div>
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="opacity-60 uppercase tracking-widest font-bold">Vence em</span>
                          <span className="opacity-60 uppercase tracking-widest font-bold">Limite Disponível</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">DIA {card.dueDay}</span>
                          <span className={cn("text-lg font-black", settings.isPrivate && "blur-lg select-none pointer-events-none opacity-40")}>
                            {formatCurrency(available)}
                          </span>
                        </div>

                        <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              usedPercent > 80 ? "bg-rose-400" : "bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]",
                            )}
                            style={{ width: `${Math.min(usedPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 p-1.5 sm:p-2 bg-black/20 rounded-lg flex items-start gap-1.5 sm:gap-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 shrink-0" />
                        <p className="text-[10px] sm:text-xs opacity-90">{getBestDayToBuy(card)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {creditCards.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={CreditCard}
                    title="Nenhum cartão cadastrado"
                    description="Adicione seus cartões de crédito para acompanhar limites, faturas e o melhor dia para compras."
                    actionLabel="Cadastrar Cartão"
                    onAction={openAddCardDialog}
                  />
                </div>
              )}
            </div>

            {/* Expenses List */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-xl font-semibold text-foreground">Despesas Parceladas</h3>
                <Button
                  onClick={() => openAddExpenseDialog()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                  disabled={creditCards.length === 0}
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Nova Despesa</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>

              <Card className="bg-card border-border overflow-hidden">
                {/* Mobile View */}
                <div className="sm:hidden divide-y divide-border">
                  {cardExpenses.map((expense) => {
                    const card = creditCards.find((c) => c.id === expense.cardId)
                    const installmentValue = expense.totalAmount / expense.installments

                    return (
                      <div key={expense.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-sm truncate">{expense.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(expense.purchaseDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                              onClick={() => openEditExpenseDialog(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150 rounded-md"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {card && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                                  card.color === "violet" && "bg-violet-400/20 text-violet-400",
                                  card.color === "orange" && "bg-orange-400/20 text-orange-400",
                                  card.color === "emerald" && "bg-emerald-400/20 text-emerald-400",
                                  card.color === "blue" && "bg-blue-400/20 text-blue-400",
                                  card.color === "rose" && "bg-rose-400/20 text-rose-400",
                                  card.color === "cyan" && "bg-cyan-400/20 text-cyan-400",
                                  card.color === "amber" && "bg-amber-400/20 text-amber-400",
                                  card.color === "slate" && "bg-slate-400/20 text-slate-400",
                                )}
                              >
                                {card.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {expense.installments === 1 ? "À vista" : `${expense.installments}x`}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-success">
                            {formatCurrency(installmentValue)}/mes
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {cardExpenses.length === 0 && (
                    <div className="py-8">
                      <EmptyState
                        icon={ShoppingCart}
                        title="Sem despesas parceladas"
                        description="Todas as suas compras parceladas aparecerão aqui, organizadas por cartão e data."
                        actionLabel="Nova Despesa"
                        onAction={() => openAddExpenseDialog()}
                      />
                    </div>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block overflow-x-auto">
                  {cardExpenses.length === 0 ? (
                    <div className="py-8">
                      <EmptyState
                        icon={ShoppingCart}
                        title="Sem despesas parceladas"
                        description="Todas as suas compras parceladas aparecerão aqui, organizadas por cartão e data."
                        actionLabel="Nova Despesa"
                        onAction={() => openAddExpenseDialog()}
                      />
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                            Descrição
                          </th>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                            Cartão
                          </th>
                          <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                            Total
                          </th>
                          <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                            Parcelas
                          </th>
                          <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                            Por mês
                          </th>
                          <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {cardExpenses.map((expense) => {
                          const card = creditCards.find((c) => c.id === expense.cardId)
                          const installmentValue = expense.totalAmount / expense.installments

                          return (
                            <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-3 sm:p-4">
                                <span className="text-foreground font-medium text-sm">{expense.description}</span>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                  Compra em {new Date(expense.purchaseDate).toLocaleDateString("pt-BR")}
                                </p>
                              </td>
                              <td className="p-3 sm:p-4">
                                <span
                                  className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    card?.color === "violet" && "bg-violet-400/20 text-violet-400",
                                    card?.color === "orange" && "bg-orange-400/20 text-orange-400",
                                    card?.color === "emerald" && "bg-emerald-400/20 text-emerald-400",
                                    card?.color === "blue" && "bg-blue-400/20 text-blue-400",
                                    card?.color === "rose" && "bg-rose-400/20 text-rose-400",
                                    card?.color === "cyan" && "bg-cyan-400/20 text-cyan-400",
                                    card?.color === "amber" && "bg-amber-400/20 text-amber-400",
                                    card?.color === "slate" && "bg-slate-400/20 text-slate-400",
                                  )}
                                >
                                  {card?.name || "—"}
                                </span>
                              </td>
                              <td className="p-3 sm:p-4 text-right text-foreground text-sm">
                                {formatCurrency(expense.totalAmount)}
                              </td>
                              <td className="p-3 sm:p-4 text-center">
                                <span className="text-foreground text-sm">
                                  {expense.installments === 1 ? "À vista" : `${expense.installments}x`}
                                </span>
                              </td>
                              <td className="p-3 sm:p-4 text-right font-semibold text-success text-sm">
                                {formatCurrency(installmentValue)}
                              </td>
                              <td className="p-3 sm:p-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                                    onClick={() => openEditExpenseDialog(expense)}
                                  >
                                    <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150 rounded-md"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Invoices Projection */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-semibold text-foreground">Projeção de Faturas</h3>

            <div className="space-y-2 sm:space-y-3">
              {invoices.map((invoice, index) => (
                <Card
                  key={index}
                  className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setExpandedInvoice(expandedInvoice === index ? null : index)}
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {invoice.month} {invoice.year}
                        </p>
                        <p className="text-xs text-muted-foreground">Fatura</p>
                      </div>
                      <p className={cn("text-base sm:text-lg font-bold text-primary", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                        {formatCurrency(invoice.total)}
                      </p>
                      {invoice.expenses.length > 0 &&
                        (expandedInvoice === index ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ))}
                    </div>

                    {expandedInvoice === index && invoice.expenses.length > 0 && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 space-y-1.5 sm:space-y-2">
                        {invoice.expenses.map((exp, i) => (
                          <div key={i} className="text-xs sm:text-sm">
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground truncate flex-1 mr-2">{exp.description}</span>
                              <span className="text-foreground font-medium flex-shrink-0">
                                {formatCurrency(exp.amount)}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/70">{exp.installment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {invoices.length === 0 && (
                <Card className="bg-card/50 border-border border-dashed p-6 sm:p-8 flex flex-col items-center justify-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">Nenhuma fatura projetada</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Dialog */}
      <ResponsiveDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        title={editingCard ? "Editar Cartão" : "Novo Cartão"}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setCardDialogOpen(false)} className="border-border bg-transparent text-xs sm:text-sm flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleSaveCard} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm flex-1 sm:flex-none">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCard ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Nome do Cartao</Label>
            <Input
              value={cardForm.name}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              placeholder="Ex: Nubank, Inter..."
              className="bg-muted border-border text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Limite (R$)</Label>
            <Input
              type="number"
              value={cardForm.limit || ""}
              onChange={(e) => setCardForm({ ...cardForm, limit: Number.parseFloat(e.target.value) || 0 })}
              className="bg-muted border-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Dia Fechamento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={cardForm.closingDay}
                onChange={(e) =>
                  setCardForm({
                    ...cardForm,
                    closingDay: Math.min(31, Math.max(1, Number.parseInt(e.target.value) || 1)),
                  })
                }
                className="bg-muted border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Dia Vencimento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={cardForm.dueDay}
                onChange={(e) =>
                  setCardForm({
                    ...cardForm,
                    dueDay: Math.min(31, Math.max(1, Number.parseInt(e.target.value) || 1)),
                  })
                }
                className="bg-muted border-border text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Banco (opcional)</Label>
            <Select
              value={cardForm.bankId?.toString() || "none"}
              onValueChange={(v) =>
                setCardForm({ ...cardForm, bankId: v === "none" ? undefined : Number.parseInt(v) })
              }
            >
              <SelectTrigger className="bg-muted border-border text-sm">
                <SelectValue placeholder="Selecione um banco" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none">Sem banco vinculado</SelectItem>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id.toString()}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      {bank.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Cor do Cartao</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {cardColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setCardForm({ ...cardForm, color: color.value })}
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br transition-all",
                    color.class,
                    cardForm.color === color.value && "ring-2 ring-white ring-offset-2 ring-offset-card",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Expense Dialog */}
      <ResponsiveDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        title={editingExpense ? "Editar Despesa" : "Nova Despesa"}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)} className="border-border bg-transparent text-xs sm:text-sm flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleSaveExpense} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm flex-1 sm:flex-none">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingExpense ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Cartao</Label>
            <Select
              value={expenseForm.cardId.toString()}
              onValueChange={(v) => setExpenseForm({ ...expenseForm, cardId: Number.parseInt(v) })}
            >
              <SelectTrigger className="bg-muted border-border text-sm">
                <SelectValue placeholder="Selecione um cartao" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id.toString()}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Descricao</Label>
            <Input
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="Ex: TV 55', Geladeira..."
              className="bg-muted border-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Valor Total (R$)</Label>
              <Input
                type="number"
                value={expenseForm.totalAmount || ""}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, totalAmount: Number.parseFloat(e.target.value) || 0 })
                }
                className="bg-muted border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Parcelas</Label>
              <Select
                value={expenseForm.installments.toString()}
                onValueChange={(v) => setExpenseForm({ ...expenseForm, installments: Number.parseInt(v) })}
              >
                <SelectTrigger className="bg-muted border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-48">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n === 1 ? "A vista" : `${n}x`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Data da Compra</Label>
            <Input
              type="date"
              value={expenseForm.purchaseDate}
              onChange={(e) => setExpenseForm({ ...expenseForm, purchaseDate: e.target.value })}
              className="bg-muted border-border text-sm"
            />
          </div>

          {expenseForm.totalAmount > 0 && expenseForm.installments > 1 && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">Valor da parcela:</p>
              <p className="text-lg sm:text-xl font-bold text-success">
                {formatCurrency(expenseForm.totalAmount / expenseForm.installments)}
              </p>
            </div>
          )}
        </div>
      </ResponsiveDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={deleteTarget?.type === "card" ? "Excluir cartão" : "Excluir despesa"}
        description={deleteTarget?.type === "card" ? "Excluir este cartão também removerá todas as despesas associadas. Esta ação não pode ser desfeita." : "Esta ação não pode ser desfeita."}
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget?.type === "card") {
            deleteCreditCard(deleteTarget.id)
          } else if (deleteTarget?.type === "expense") {
            deleteCardExpense(deleteTarget.id)
          }
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
