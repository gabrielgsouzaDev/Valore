"use client"

import { useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
    Loader2,
    Download,
    Upload,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { ScheduledTransaction } from "@/lib/types"
import { cn } from "@/lib/utils"
import { OfxImporter } from "@/components/ofx-importer"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { formatCurrency, formatDate } from "@/lib/services"
import NumberTicker from "@/components/ui/number-ticker"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
        addCategory,
        monthlyScheduledIncome,
        monthlyScheduledExpenses,
        settings,
    } = useApp()

    const [activeTab, setActiveTab] = useState<Tab>("agendadas")
    const [form, setForm] = useState<TransactionForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filter, setFilter] = useState<"todos" | "pendente" | "pago">("todos")
    const [typeFilter, setTypeFilter] = useState<"todos" | "pagamento" | "ganho">("todos")
    const [showFilters, setShowFilters] = useState(false)
    const [ofxOpen, setOfxOpen] = useState(false)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d")
    const [histTypeFilter, setHistTypeFilter] = useState<"todos" | "pagamento" | "ganho">("todos")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [catDialogOpen, setCatDialogOpen] = useState(false)
    const [newCatName, setNewCatName] = useState("")
    const [newCatColor, setNewCatColor] = useState("slate")
    const { toast } = useToast()
    const showActions = true

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

    const agendadasTransactions = processedTransactions.filter(t => t.status === "pendente" || t.status === "atrasado")

    const filteredTransactions = agendadasTransactions
        .filter((t) => filter === "todos" || t.status === filter)
        .filter((t) => typeFilter === "todos" || t.type === typeFilter)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    // Agrupamento temporal inteligente
    const getGroup = (dueDateStr: string) => {
        const d = new Date(dueDateStr)
        d.setHours(0, 0, 0, 0)
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "hoje"
        if (diffDays > 0 && diffDays <= 7) return "semana"
        if (diffDays > 7 && diffDays <= 15) return "quinzena"
        return "futuro"
    }

    const groupedTransactions = {
        hoje: filteredTransactions.filter(t => getGroup(t.dueDate) === "hoje"),
        semana: filteredTransactions.filter(t => getGroup(t.dueDate) === "semana"),
        quinzena: filteredTransactions.filter(t => getGroup(t.dueDate) === "quinzena"),
        futuro: filteredTransactions.filter(t => getGroup(t.dueDate) === "futuro"),
    }

    // ── Resumo Financeiro Agendadas ──
    const agendadasIncome = filteredTransactions.filter(t => t.type === "ganho").reduce((sum, t) => sum + t.amount, 0)
    const agendadasExpenses = filteredTransactions.filter(t => t.type === "pagamento").reduce((sum, t) => sum + t.amount, 0)
    const agendadasBalance = agendadasIncome - agendadasExpenses

    // ── ABA HISTÓRICO ─────────────────────────────────────────────
    // ── PROJEÇÃO DE FLUXO DE CAIXA (30 DIAS) ──────────────────────
    const projectionData = Array.from({ length: 30 }).map((_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().split("T")[0]

        // Saldo base (considerando pendentes e atrasados acumulados)
        const dayTransactions = filteredTransactions.filter(t => (t.status === "pendente" || t.status === "atrasado") && t.dueDate <= dateStr)
        const balance = dayTransactions.reduce((acc, t) => acc + (t.type === "ganho" ? t.amount : -t.amount), 0)

        return {
            name: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            saldo: balance,
            originalDate: dateStr
        }
    })

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
    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return
        setIsSubmitting(true)
        try {
            await new Promise(r => setTimeout(r, 300))
            addCategory({
                name: newCatName.trim(),
                percentage: 0,
                budgeted: 0,
                color: newCatColor,
            })
            toast({ title: "Categoria global criada" })
            setNewCatName("")
            setCatDialogOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async () => {
        if (!form.name || form.amount <= 0) return
        setIsSubmitting(true)
        try {
            await new Promise(r => setTimeout(r, 400))
            if (!form.name || form.amount <= 0) return
            if (editingId) {
                updateTransaction(editingId, form)
                toast({ title: "Transação atualizada" })
            } else {
                addTransaction({ ...form, status: "pendente" })
                toast({ title: "Transação criada" })
            }
            setForm(emptyForm)
            setEditingId(null)
            setDialogOpen(false)
        } finally {
            setIsSubmitting(false)
        }
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
    const TransactionRow = ({ transaction, index }: { transaction: ScheduledTransaction & { status: "pendente" | "pago" | "atrasado" }, index?: number }) => {
        const bank = transaction.bankId ? getBankById(transaction.bankId) : null
        const categoryName = getCategoryName(transaction.categoryId)
        const isAtrasado = transaction.status === "atrasado"

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index || 0) * 0.05 }}
                className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all gap-3",
                    isAtrasado
                        ? "bg-danger/5 border-danger/20 animate-pulse-critical"
                        : "bg-card border-border/50 hover:border-primary/30"
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
                            <span className="font-bold text-foreground text-sm sm:text-base truncate tracking-tight">{transaction.name}</span>
                            {transaction.recurrence !== "unico" && (
                                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    <Repeat className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    {getRecurrenceLabel(transaction.recurrence)}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground font-medium">{formatDate(transaction.dueDate)}</span>
                            {bank && (
                                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-accent/10 rounded text-accent flex items-center gap-1 font-semibold">
                                    <Building2 className="h-2.5 w-2.5" />{bank.name}
                                </span>
                            )}
                            {categoryName && (
                                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-medium">{categoryName}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-6 border-t sm:border-t-0 border-border/10 pt-2 sm:pt-0">
                    <div className="flex items-center gap-3">
                        <span className={cn("text-base sm:text-lg font-black tracking-tighter",
                            transaction.type === "ganho" ? "text-success" : "text-danger",
                            settings.isPrivate && "blur-md select-none pointer-events-none opacity-40"
                        )}>
                            {transaction.type === "ganho" ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </span>
                        <span className={cn("text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full capitalize font-bold tracking-widest uppercase", getStatusColor(transaction.status))}>
                            {transaction.status}
                        </span>
                    </div>

                    {showActions && (
                        <div className="flex gap-1">
                            {transaction.status !== "pago" && (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-success/20 hover:text-success transition-all rounded-xl" onClick={() => markAsPaid(transaction.id)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all rounded-xl" onClick={() => handleEdit(transaction)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-danger/20 hover:text-danger transition-all rounded-xl" onClick={() => { setTransactionToDelete(transaction.id); setConfirmOpen(true) }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        )
    }

    return (
        <>
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

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="border-border bg-card/50 text-foreground text-xs sm:text-sm font-semibold shadow-sm hover:bg-muted"
                            onClick={() => setOfxOpen(true)}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                        </Button>
                        <ResponsiveDialog
                            open={dialogOpen}
                            onOpenChange={handleOpenChange}
                            trigger={
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-lg shadow-primary/20">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Transação
                                </Button>
                            }

                            title={editingId ? "Editar Transação" : "Nova Transação"}
                            footer={
                                <div className="flex justify-end gap-2 w-full">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border bg-transparent text-xs sm:text-sm flex-1 sm:flex-none">Cancelar</Button>
                                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm flex-1 sm:flex-none">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingId ? "Salvar" : "Criar"}
                                    </Button>
                                </div>
                            }
                        >

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
                                            <div className="px-2 py-1.5 mt-1 border-t border-border/50"><Button variant="ghost" className="w-full justify-start text-xs h-8 text-primary hover:bg-primary/10" onClick={(e) => { e.preventDefault(); setCatDialogOpen(true); }}><Plus className="mr-2 h-3.5 w-3.5" /> Nova Categoria Global</Button></div>
                                            {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs sm:text-sm">Observações (opcional)</Label>
                                <Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anotações..." className="bg-muted border-border text-foreground text-sm" />
                            </div>
                        </ResponsiveDialog>
                    </div>
                </div>
            </header>
            <DemoBanner />

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <Card className="bg-card border-border border-l-4 border-l-success shadow-sm overflow-hidden group">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-success/10 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        {activeTab === "agendadas" ? "Entradas Previstas" : "Entradas Realizadas"}
                                    </p>
                                    <div className={cn("text-lg sm:text-2xl font-black text-success flex items-baseline gap-1", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                        <span className="text-sm font-bold opacity-60">R$</span>
                                        <NumberTicker value={activeTab === "agendadas" ? agendadasIncome : historyIncome} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border border-l-4 border-l-danger shadow-sm overflow-hidden group">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-danger/10 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-danger" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        {activeTab === "agendadas" ? "Saídas Previstas" : "Saídas Realizadas"}
                                    </p>
                                    <div className={cn("text-lg sm:text-2xl font-black text-danger flex items-baseline gap-1", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                        <span className="text-sm font-bold opacity-60">R$</span>
                                        <NumberTicker value={activeTab === "agendadas" ? agendadasExpenses : historyExpenses} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border border-l-4 border-l-primary shadow-sm overflow-hidden group">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform", (activeTab === "agendadas" ? agendadasBalance : historyBalance) >= 0 ? "bg-success/10" : "bg-danger/10")}>
                                    <Calendar className={cn("h-5 w-5 sm:h-6 sm:w-6", (activeTab === "agendadas" ? agendadasBalance : historyBalance) >= 0 ? "text-success" : "text-danger")} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        {activeTab === "agendadas" ? "Saldo Projetado" : "Saldo do Período"}
                                    </p>
                                    <div className={cn("text-lg sm:text-2xl font-black flex items-baseline gap-1",
                                        (activeTab === "agendadas" ? agendadasBalance : historyBalance) >= 0 ? "text-success" : "text-danger",
                                        settings.isPrivate && "blur-md select-none pointer-events-none opacity-40"
                                    )}>
                                        <span className="text-sm font-bold opacity-60">R$</span>
                                        <NumberTicker value={activeTab === "agendadas" ? agendadasBalance : historyBalance} />
                                    </div>
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

                        {/* Projeção de Fluxo de Caixa */}
                        <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden">
                            <CardContent className="p-4 sm:p-6">
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                        Projeção de Fluxo (30 dias)
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium italic opacity-70">
                                        *Considerando apenas transações pendentes e agendadas.
                                    </p>
                                </div>
                                <div className="h-[120px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={projectionData}>
                                            <defs>
                                                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                content={(props) => {
                                                    const { active, payload } = props
                                                    if (active && payload && payload.length) {
                                                        const val = (payload[0].value ?? 0) as number
                                                        const label = (payload[0].payload as { name: string }).name
                                                        return (
                                                            <div className="bg-card border border-border p-2 rounded-lg shadow-xl text-[10px] font-bold">
                                                                <p className="text-muted-foreground">{label}</p>
                                                                <p className={val >= 0 ? "text-success" : "text-danger"}>
                                                                    {formatCurrency(val)}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="saldo"
                                                stroke="var(--color-primary)"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorSaldo)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {filteredTransactions.length === 0 ? (
                            <EmptyState
                                icon={ListTodo}
                                title="Nenhuma transação agendada"
                                description="Organize suas finanças cadastrando seus ganhos e despesas futuras para ter uma visão clara do seu saldo."
                                actionLabel="Nova Transação"
                                onAction={() => setDialogOpen(true)}
                            />
                        ) : (
                            <div className="space-y-8">
                                <AnimatePresence mode="popLayout">
                                    {Object.entries(groupedTransactions).map(([key, groupItems]) => {
                                        if (groupItems.length === 0) return null;
                                        const labels = { hoje: "Hoje", semana: "Esta Semana", quinzena: "Próxima Quinzena", futuro: "Futuro" };
                                        return (
                                            <div key={key} className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                                    </span>
                                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                        {labels[key as keyof typeof labels]}
                                                    </h3>
                                                    <div className="h-px bg-border/40 flex-1 ml-2"></div>
                                                </div>
                                                <div className="space-y-2 sm:space-y-3">
                                                    {groupItems.map((transaction, idx) => (
                                                        <TransactionRow key={transaction.id} transaction={transaction} index={idx} />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </AnimatePresence>
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

                        {/* Resumo do período Bento */}
                        {historyTransactions.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <Card className="sm:col-span-2 bg-success/5 border-success/20">
                                    <CardContent className="p-4 flex flex-col justify-between h-full">
                                        <p className="text-xs font-bold text-success/70 uppercase tracking-widest mb-4">Entradas no período</p>
                                        <div className={cn("text-2xl sm:text-3xl font-black text-success flex items-baseline gap-1", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                            <span className="text-base font-bold opacity-60">R$</span>
                                            <NumberTicker value={historyIncome} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="sm:col-span-2 bg-danger/5 border-danger/20">
                                    <CardContent className="p-4 flex flex-col justify-between h-full">
                                        <p className="text-xs font-bold text-danger/70 uppercase tracking-widest mb-4">Saídas no período</p>
                                        <div className={cn("text-2xl sm:text-3xl font-black text-danger flex items-baseline gap-1", settings.isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                            <span className="text-base font-bold opacity-60">R$</span>
                                            <NumberTicker value={historyExpenses} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card border-border sm:col-span-1">
                                    <CardContent className="p-4">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Qtd. Transações</p>
                                        <p className="text-xl font-black">{historyTransactions.length}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card border-border sm:col-span-3">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Saldo Líquido</p>
                                            <p className={cn("text-xl font-black", historyBalance >= 0 ? "text-success" : "text-danger")}>
                                                {formatCurrency(historyBalance)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Média por Transação</p>
                                            <p className="text-sm font-bold opacity-80">
                                                {formatCurrency(historyTransactions.length > 0 ? historyIncome / historyTransactions.length : 0)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {historyTransactions.length === 0 ? (
                            <EmptyState
                                icon={History}
                                title="Histórico vazio"
                                description="Aqui aparecerão as transações que você já realizou. Marque uma transação agendada como 'paga' para vê-la aqui."
                            />
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {historyTransactions.map((transaction) => (
                                    <TransactionRow key={transaction.id} transaction={transaction} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ResponsiveDialog
                open={catDialogOpen}
                onOpenChange={setCatDialogOpen}
                title="Nova Categoria Global"
                description="Categorias não estão mais presas a orçamentos, você pode usá-las livremente."
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => setCatDialogOpen(false)} className="border-border bg-transparent text-xs sm:text-sm flex-1 sm:flex-none">Cancelar</Button>
                        <Button onClick={handleCreateCategory} disabled={!newCatName.trim() || isSubmitting} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm flex-1 sm:flex-none">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Criar
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs sm:text-sm">Nome da Categoria</Label>
                        <Input value={newCatName} autoFocus onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Viagens, Streamings..." className="bg-muted border-border text-foreground text-sm" />
                    </div>
                </div>
            </ResponsiveDialog>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Excluir transação"
                description="Esta ação não pode ser desfeita."
                variant="destructive"
                onConfirm={() => {
                    if (transactionToDelete !== null) {
                        deleteTransaction(transactionToDelete)
                        setTransactionToDelete(null)
                    }
                }}
            />
            {/* OFX Importer */}
            <OfxImporter open={ofxOpen} onOpenChange={setOfxOpen} />
        </>
    )
}
