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
    History,
    ListTodo,
    Receipt,
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

type Tab = "agendadas" | "historico"
type PeriodFilter = "7d" | "30d" | "3m" | "todos"

export default function TransacoesPage() {
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
    } = useApp()

    const [activeTab, setActiveTab] = useState<Tab>("agendadas")
    const [form, setForm] = useState<TransactionForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filter, setFilter] = useState<"todos" | "pendente" | "pago">("todos")
    const [typeFilter, setTypeFilter] = useState<"todos" | "pagamento" | "ganho">("todos")
    const [showFilters, setShowFilters] = useState(false)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d")
    const [histTypeFilter, setHistTypeFilter] = useState<"todos" | "pagamento" | "ganho">("todos")

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        try {
            const parts = dateString.split("T")[0].split("-")
            if (parts.length !== 3) return dateString
            const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            if (isNaN(date.getTime())) return "Data Inválida"
            return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
        } catch {
            return "Data Inválida"
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // ── ABA AGENDADAS ─────────────────────────────────────────────
    const processedTransactions = transactions.map((t) => {
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        if (t.status === "pendente" && dueDate < today) {
            return { ...t, status: "atrasado" as const }
        }
        return t
    })

    const agendadasTransactions = processedTransactions.filter(t => t.status === "pendente")

    const filteredTransactions = agendadasTransactions
        .filter((t) => filter === "todos" || t.status === filter)
        .filter((t) => typeFilter === "todos" || t.type === typeFilter)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    // ── Resumo Financeiro Agendadas ──
    const agendadasIncome = filteredTransactions.filter(t => t.type === "ganho").reduce((sum, t) => sum + t.amount, 0)
    const agendadasExpenses = filteredTransactions.filter(t => t.type === "pagamento").reduce((sum, t) => sum + t.amount, 0)
    const agendadasBalance = agendadasIncome - agendadasExpenses

    // ── ABA HISTÓRICO ─────────────────────────────────────────────
    const getPeriodMs = (): number => {
        if (periodFilter === "7d") return 7 * 24 * 60 * 60 * 1000
        if (periodFilter === "30d") return 30 * 24 * 60 * 60 * 1000
        if (periodFilter === "3m") return 90 * 24 * 60 * 60 * 1000
        return Infinity
    }

    const historyBaseTransactions = processedTransactions.filter(t => t.status === "pago" || t.status === "atrasado")

    const historyTransactions = historyBaseTransactions
        .filter((t) => {
            if (histTypeFilter !== "todos" && t.type !== histTypeFilter) return false
            if (getPeriodMs() === Infinity) return true
            const txDate = new Date(t.dueDate)
            return today.getTime() - txDate.getTime() <= getPeriodMs()
        })
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

    // ── Resumo Financeiro Histórico ──
    const historyIncome = historyTransactions.filter(t => t.type === "ganho").reduce((sum, t) => sum + t.amount, 0)
    const historyExpenses = historyTransactions.filter(t => t.type === "pagamento").reduce((sum, t) => sum + t.amount, 0)
    const historyBalance = historyIncome - historyExpenses

    // ── FORM HANDLERS ──────────────────────────────────────────────
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pago":
            case "realizado": return "text-success bg-success/10"
            case "pendente":
            case "agendado": return "text-warning bg-warning/10"
            case "atrasado": return "text-danger bg-danger/10"
            default: return "text-muted-foreground bg-muted"
        }
    }

    const getRecurrenceLabel = (recurrence: string) => {
        const map: Record<string, string> = { unico: "Único", semanal: "Semanal", mensal: "Mensal", anual: "Anual" }
        return map[recurrence] || recurrence
    }

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return null
        return categories.find((c) => c.id === categoryId)?.name || null
    }

    // ── TRANSACTION CARD (reaproveitado nas 2 abas) ───────────────
    const TransactionRow = ({ transaction, showActions = true }: { transaction: ScheduledTransaction & { status: "pendente" | "pago" | "atrasado" }, showActions?: boolean }) => {
        const bank = transaction.bankId ? getBankById(transaction.bankId) : null
        const categoryName = getCategoryName(transaction.categoryId)
        return (
            <div
                className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all gap-3",
                    transaction.status === "atrasado"
                        ? "bg-muted/80 border-border"
                        : "bg-muted/40 border-border/50 hover:border-border"
                )}
            >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className={cn("p-2 rounded-lg flex-shrink-0", transaction.type === "ganho" ? "bg-success/10" : "bg-danger/10")}>
                        {transaction.type === "ganho"
                            ? <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                            : <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
                        }
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
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">{formatDate(transaction.dueDate)}</span>
                            {bank && (
                                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-muted rounded text-accent flex items-center gap-1">
                                    <Building2 className="h-2.5 w-2.5" />{bank.name}
                                </span>
                            )}
                            {categoryName && (
                                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{categoryName}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm sm:text-base font-bold", transaction.type === "ganho" ? "text-success" : "text-danger")}>
                            {transaction.type === "ganho" ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </span>
                        <span className={cn("text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full capitalize", getStatusColor(transaction.status))}>
                            {transaction.status}
                        </span>
                    </div>

                    {showActions && (
                        <div className="flex gap-1">
                            {transaction.status !== "pago" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-success transition-colors duration-150 rounded-md" onClick={() => markAsPaid(transaction.id)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md" onClick={() => handleEdit(transaction)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150 rounded-md" onClick={() => { if (confirm("Excluir esta transação?")) deleteTransaction(transaction.id) }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />

            <main className="lg:ml-64 transition-all duration-300 pb-20 lg:pb-0">
                {/* Header */}
                <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
                    <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                            <div className="flex flex-col justify-center">
                                <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Transações</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">Fluxo de caixa • Histórico</p>
                            </div>
                        </div>

                        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm w-full sm:w-auto">
                                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                    Nova Transação
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border text-foreground max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-foreground text-base sm:text-lg">
                                        {editingId ? "Editar Transação" : "Nova Transação"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-muted-foreground text-xs sm:text-sm">Nome</Label>
                                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Salário, Aluguel..." className="bg-muted border-border text-foreground text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs sm:text-sm">Tipo</Label>
                                            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "pagamento" | "ganho" })}>
                                                <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    <SelectItem value="ganho"><span className="flex items-center gap-2 text-success"><ArrowUpCircle className="h-3.5 w-3.5" /> Ganho</span></SelectItem>
                                                    <SelectItem value="pagamento"><span className="flex items-center gap-2 text-muted-foreground"><ArrowDownCircle className="h-3.5 w-3.5" /> Pagamento</span></SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs sm:text-sm">Valor (R$)</Label>
                                            <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number.parseFloat(e.target.value) || 0 })} className="bg-muted border-border text-foreground text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs sm:text-sm">Vencimento</Label>
                                            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="bg-muted border-border text-foreground text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs sm:text-sm">Recorrência</Label>
                                            <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v as "unico" | "semanal" | "mensal" | "anual" })}>
                                                <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue /></SelectTrigger>
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
                                        <Select value={form.bankId?.toString() || "none"} onValueChange={(v) => setForm({ ...form, bankId: v === "none" ? undefined : Number.parseInt(v) })}>
                                            <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue placeholder="Selecione um banco" /></SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                <SelectItem value="none">Sem banco vinculado</SelectItem>
                                                {banks.map((bank) => (<SelectItem key={bank.id} value={bank.id.toString()}><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{bank.name}</span></SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {form.type === "pagamento" && (
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs sm:text-sm">Categoria (opcional)</Label>
                                            <Select value={form.categoryId?.toString() || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? undefined : Number.parseInt(v) })}>
                                                <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    <SelectItem value="none">Sem categoria</SelectItem>
                                                    {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label className="text-muted-foreground text-xs sm:text-sm">Observações (opcional)</Label>
                                        <Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anotações..." className="bg-muted border-border text-foreground text-sm" />
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <DialogClose asChild>
                                        <Button variant="ghost" className="text-muted-foreground text-xs sm:text-sm">Cancelar</Button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <Card className="bg-card border-border">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-success/10 rounded-lg flex-shrink-0"><TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                                            {activeTab === "agendadas" ? "Entradas Previstas" : "Entradas Realizadas"}
                                        </p>
                                        <p className="text-sm sm:text-xl font-bold text-success truncate">
                                            {formatCurrency(activeTab === "agendadas" ? agendadasIncome : historyIncome)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-danger/10 rounded-lg flex-shrink-0"><TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-danger" /></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                                            {activeTab === "agendadas" ? "Saídas Previstas" : "Saídas Realizadas"}
                                        </p>
                                        <p className="text-sm sm:text-xl font-bold text-danger truncate">
                                            {formatCurrency(activeTab === "agendadas" ? agendadasExpenses : historyExpenses)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={(activeTab === "agendadas" ? agendadasBalance : historyBalance) >= 0 ? "p-1.5 sm:p-2 bg-success/10 rounded-lg flex-shrink-0" : "p-1.5 sm:p-2 bg-danger/10 rounded-lg flex-shrink-0"}>
                                        <Calendar className={(activeTab === "agendadas" ? agendadasBalance : historyBalance) >= 0 ? "h-4 w-4 sm:h-5 sm:w-5 text-success" : "h-4 w-4 sm:h-5 sm:w-5 text-danger"} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                                            {activeTab === "agendadas" ? "Saldo Projetado" : "Saldo do Período"}
                                        </p>
                                        <p className={cn("text-sm sm:text-xl font-bold truncate", (activeTab === "agendadas" ? agendadasBalance : historyBalance) >= 0 ? "text-success" : "text-danger")}>
                                            {formatCurrency(activeTab === "agendadas" ? agendadasBalance : historyBalance)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl mb-4 sm:mb-6 w-full sm:w-auto sm:inline-flex">
                        <button
                            onClick={() => setActiveTab("agendadas")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center",
                                activeTab === "agendadas"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ListTodo className="h-4 w-4" />
                            Agendadas
                        </button>
                        <button
                            onClick={() => setActiveTab("historico")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center",
                                activeTab === "historico"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="h-4 w-4" />
                            Histórico
                        </button>
                    </div>

                    {/* ── ABA AGENDADAS ──────────────────────────────── */}
                    {activeTab === "agendadas" && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden border-border bg-transparent text-xs">
                                    <Filter className="h-3.5 w-3.5 mr-1" /> Filtros
                                </Button>
                                <div className={cn("flex-wrap gap-2", showFilters ? "flex" : "hidden lg:flex", "w-full lg:w-auto")}>
                                    <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                                        <SelectTrigger className="w-full sm:w-36 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="todos">Todos Status</SelectItem>
                                            <SelectItem value="pendente">Pendentes</SelectItem>
                                            <SelectItem value="pago">Pagos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                                        <SelectTrigger className="w-full sm:w-36 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="todos">Todos Tipos</SelectItem>
                                            <SelectItem value="ganho">Ganhos</SelectItem>
                                            <SelectItem value="pagamento">Pagamentos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-16">
                                    <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                                    <p className="text-muted-foreground font-medium">Nenhuma transação encontrada</p>
                                    <p className="text-sm text-muted-foreground/60 mt-1">Crie uma nova transação para começar</p>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {filteredTransactions.map((transaction) => (
                                        <TransactionRow key={transaction.id} transaction={transaction} showActions />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ABA HISTÓRICO ──────────────────────────────── */}
                    {activeTab === "historico" && (
                        <div className="space-y-4">
                            {/* Period + type filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                                    {(["7d", "30d", "3m", "todos"] as PeriodFilter[]).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPeriodFilter(p)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                                periodFilter === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "3m" ? "3 meses" : "Tudo"}
                                        </button>
                                    ))}
                                </div>
                                <Select value={histTypeFilter} onValueChange={(v) => setHistTypeFilter(v as typeof histTypeFilter)}>
                                    <SelectTrigger className="w-36 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="todos">Todos Tipos</SelectItem>
                                        <SelectItem value="ganho">Ganhos</SelectItem>
                                        <SelectItem value="pagamento">Pagamentos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Resumo do período */}
                            {historyTransactions.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-success/5 border border-success/20 rounded-xl p-3 sm:p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Entradas no período</p>
                                        <p className="text-base sm:text-xl font-bold text-success">{formatCurrency(historyIncome)}</p>
                                    </div>
                                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 sm:p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Saídas no período</p>
                                        <p className="text-base sm:text-xl font-bold text-danger">{formatCurrency(historyExpenses)}</p>
                                    </div>
                                </div>
                            )}

                            {historyTransactions.length === 0 ? (
                                <div className="text-center py-16">
                                    <History className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                                    <p className="text-muted-foreground font-medium">Nenhuma transação no histórico</p>
                                    <p className="text-sm text-muted-foreground/60 mt-1">Marque transações como pagas para vê-las aqui</p>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {historyTransactions.map((transaction) => (
                                        <TransactionRow key={transaction.id} transaction={transaction} showActions={false} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
