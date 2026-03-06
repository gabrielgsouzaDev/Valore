"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Check,
  Pencil,
  Trash2,
  AlertTriangle,
  Repeat,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  Filter,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import type { ScheduledTransaction } from "@/lib/types"
import { cn } from "@/lib/utils"

type TransactionForm = Omit<ScheduledTransaction, "id" | "status">

const emptyForm: TransactionForm = {
  name: "",
  amount: 0,
  type: "pagamento",
  dueDate: new Date().toISOString().split("T")[0],
  recurrence: "mensal",
  categoryId: undefined,
  bankId: undefined,
  notes: "",
}

export default function PlanejamentoPage() {
  const {
    transactions,
    categories,
    banks,
    getBankById,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    monthlyScheduledIncome,
    monthlyScheduledExpenses,
    settings,
  } = useApp()

  const [form, setForm] = useState<TransactionForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"todos" | "pendente" | "pago">("todos")
  const [typeFilter, setTypeFilter] = useState<"todos" | "pagamento" | "ganho">("todos")
  const [showFilters, setShowFilters] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const processedTransactions = transactions.map((t) => {
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    if (t.status === "pendente" && dueDate < today) {
      return { ...t, status: "atrasado" as const }
    }
    return t
  })

  const filteredTransactions = processedTransactions
    .filter((t) => filter === "todos" || t.status === filter)
    .filter((t) => typeFilter === "todos" || t.type === typeFilter)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const pendingCount = processedTransactions.filter((t) => t.status === "pendente").length
  const overdueCount = processedTransactions.filter((t) => t.status === "atrasado").length
  const monthlyBalance = monthlyScheduledIncome - monthlyScheduledExpenses

  const handleSubmit = () => {
    if (!form.name || form.amount <= 0) return

    if (editingId) {
      updateTransaction(editingId, form)
    } else {
      addTransaction({ ...form, status: "pendente" })
    }

    setForm(emptyForm)
    setEditingId(null)
    setDialogOpen(false)
  }

  const handleEdit = (transaction: ScheduledTransaction) => {
    setForm({
      name: transaction.name,
      amount: transaction.amount,
      type: transaction.type,
      dueDate: transaction.dueDate,
      recurrence: transaction.recurrence,
      categoryId: transaction.categoryId,
      bankId: transaction.bankId,
      notes: transaction.notes,
    })
    setEditingId(transaction.id)
    setDialogOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setForm(emptyForm)
      setEditingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      const parts = dateString.split("T")[0].split("-")
      if (parts.length !== 3) return dateString
      // Cria a data no fuso local meia-noite
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      if (isNaN(date.getTime())) return "Data Inválida"
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    } catch {
      return "Data Inválida"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "text-success bg-success/10"
      case "pendente":
        return "text-warning bg-warning/10"
      case "atrasado":
        return "text-danger bg-danger/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getRecurrenceLabel = (recurrence: string) => {
    switch (recurrence) {
      case "unico":
        return "Unico"
      case "semanal":
        return "Semanal"
      case "mensal":
        return "Mensal"
      case "anual":
        return "Anual"
      default:
        return recurrence
    }
  }

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return null
    const category = categories.find((c) => c.id === categoryId)
    return category?.name
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="lg:ml-64 transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
          <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col justify-center">
              <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Planejamento</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">Fluxo de caixa • Agendamentos</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm w-full sm:w-auto">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base sm:text-lg">
                    {editingId ? "Editar Transação" : "Nova Transação"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Nome</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Salario, Aluguel..."
                      className="bg-muted border-border text-foreground text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs sm:text-sm">Tipo</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v as "pagamento" | "ganho" })}
                      >
                        <SelectTrigger className="bg-muted border-border text-foreground text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="ganho" className="text-success">
                            <span className="flex items-center gap-2">
                              <ArrowUpCircle className="h-3.5 w-3.5" /> Ganho
                            </span>
                          </SelectItem>
                          <SelectItem value="pagamento" className="text-danger">
                            <span className="flex items-center gap-2">
                              <ArrowDownCircle className="h-3.5 w-3.5" /> Pagamento
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs sm:text-sm">Valor (R$)</Label>
                      <Input
                        type="number"
                        value={form.amount || ""}
                        onChange={(e) => setForm({ ...form, amount: Number.parseFloat(e.target.value) || 0 })}
                        className="bg-muted border-border text-foreground text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs sm:text-sm">Vencimento</Label>
                      <Input
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        className="bg-muted border-border text-foreground text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs sm:text-sm">Recorrencia</Label>
                      <Select
                        value={form.recurrence}
                        onValueChange={(v) =>
                          setForm({ ...form, recurrence: v as "unico" | "semanal" | "mensal" | "anual" })
                        }
                      >
                        <SelectTrigger className="bg-muted border-border text-foreground text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="unico">Único</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Banco / Conta</Label>
                    <Select
                      value={form.bankId?.toString() || "none"}
                      onValueChange={(v) => setForm({ ...form, bankId: v === "none" ? undefined : Number.parseInt(v) })}
                    >
                      <SelectTrigger className="bg-muted border-border text-foreground text-sm">
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

                  {form.type === "pagamento" && (
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs sm:text-sm">Categoria (opcional)</Label>
                      <Select
                        value={form.categoryId?.toString() || "none"}
                        onValueChange={(v) =>
                          setForm({ ...form, categoryId: v === "none" ? undefined : Number.parseInt(v) })
                        }
                      >
                        <SelectTrigger className="bg-muted border-border text-foreground text-sm">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="none">Sem categoria</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Observações (opcional)</Label>
                    <Input
                      value={form.notes || ""}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Anotações..."
                      className="bg-muted border-border text-foreground text-sm"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-muted-foreground text-xs sm:text-sm">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                    {editingId ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-success/10 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Entradas</p>
                    <p className="text-sm sm:text-xl font-bold text-success truncate">
                      {formatCurrency(monthlyScheduledIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-danger/10 rounded-lg flex-shrink-0">
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Saídas</p>
                    <p className="text-sm sm:text-xl font-bold text-danger truncate">
                      {formatCurrency(monthlyScheduledExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                      monthlyBalance >= 0 ? "bg-success/10" : "bg-danger/10",
                    )}
                  >
                    <Calendar
                      className={cn("h-4 w-4 sm:h-5 sm:w-5", monthlyBalance >= 0 ? "text-success" : "text-danger")}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Saldo</p>
                    <p
                      className={cn(
                        "text-sm sm:text-xl font-bold truncate",
                        monthlyBalance >= 0 ? "text-success" : "text-danger",
                      )}
                    >
                      {formatCurrency(monthlyBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                      overdueCount > 0 ? "bg-danger/10" : "bg-warning/10",
                    )}
                  >
                    {overdueCount > 0 ? (
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
                    ) : (
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Pendentes</p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-sm sm:text-xl font-bold text-warning">{pendingCount}</span>
                      {overdueCount > 0 && (
                        <span className="text-[10px] sm:text-sm text-danger">({overdueCount})</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-border bg-transparent text-xs"
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filtros
            </Button>

            <div className={cn("flex-wrap gap-2", showFilters ? "flex" : "hidden lg:flex", "w-full lg:w-auto")}>
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-full sm:w-32 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="pago">Pagos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="w-full sm:w-32 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="ganho">Ganhos</SelectItem>
                  <SelectItem value="pagamento">Pagamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Transações Agendadas</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-border bg-transparent text-xs sm:text-sm"
                >
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  Filtros
                </Button>
              </div>

              {showFilters && (
                <div className="grid sm:grid-cols-2 gap-2 bg-muted/50 rounded-lg p-3 sm:p-4">
                  <Select value={filter} onValueChange={(v: typeof filter) => setFilter(v)}>
                    <SelectTrigger className="bg-card border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="pago">Pagos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={(v: typeof typeFilter) => setTypeFilter(v)}>
                    <SelectTrigger className="bg-card border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pagamento">Pagamentos</SelectItem>
                      <SelectItem value="ganho">Ganhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filteredTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma transação encontrada</p>
              ) : (
                filteredTransactions.map((transaction) => {
                  const bank = transaction.bankId ? getBankById(transaction.bankId) : null
                  const categoryName = getCategoryName(transaction.categoryId)

                  return (
                    <div
                      key={transaction.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border transition-all gap-3",
                        transaction.status === "atrasado"
                          ? "bg-muted/50 border-border/50"
                          : "bg-muted/50 border-border/50 hover:border-border",
                      )}
                      style={{
                        backgroundColor: transaction.status === "atrasado" ? "rgb(var(--theme-danger) / 0.15)" : undefined,
                        borderColor: transaction.status === "atrasado" ? "var(--danger)" : undefined
                      }}
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                          )}
                          style={{
                            backgroundColor: transaction.type === "ganho" ? "rgb(var(--theme-success) / 0.1)" : "rgb(var(--theme-danger) / 0.1)"
                          }}
                        >
                          {transaction.type === "ganho" ? (
                            <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: "var(--success)" }} />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: "var(--danger)" }} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground text-sm truncate">{transaction.name}</span>
                            {transaction.recurrence !== "unico" && (
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                <Repeat className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {getRecurrenceLabel(transaction.recurrence)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{formatDate(transaction.dueDate)}</span>
                            {bank && (
                              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-muted rounded text-accent flex items-center gap-1">
                                <Building2 className="h-2.5 w-2.5" />
                                {bank.name}
                              </span>
                            )}
                            {categoryName && (
                              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                                {categoryName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm sm:text-lg font-bold",
                            )}
                            style={{ color: transaction.type === "ganho" ? "var(--success)" : "var(--danger)" }}
                          >
                            {transaction.type === "ganho" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full capitalize",
                              getStatusColor(transaction.status),
                            )}
                          >
                            {transaction.status}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          {transaction.status !== "pago" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-success transition-colors duration-150 rounded-md"
                              onClick={() => markAsPaid(transaction.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150 rounded-md"
                            onClick={() => {
                              if (confirm("Excluir esta transação?")) {
                                deleteTransaction(transaction.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
