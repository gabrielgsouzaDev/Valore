"use client"

import { useState, useMemo } from "react"
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
    Plus,
    Receipt,
    Upload,
    Download,
    X,
    Check,
    Trash2,
    History,
    ListTodo,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { ScheduledTransaction } from "@/lib/types"
import { cn } from "@/lib/utils"
import { OfxImporter } from "@/components/ofx-importer"
import { motion, AnimatePresence } from "framer-motion"
import { BUSINESS_RULES } from "@/lib/business-constants"

// Local Atomic Components
import { SummaryCards } from "./components/SummaryCards"
import { TransactionFilters } from "./components/TransactionFilters"
import { ProjectionChart } from "./components/ProjectionChart"
import { TransactionList } from "./components/TransactionList"
import { TransactionDialog } from "./components/TransactionDialog"

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
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const { toast } = useToast()

    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    // ── ABA AGENDADAS (Logical Processing) ─────────────────────────
    const processedTransactions = useMemo(() => transactions.map((t) => {
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        if (t.status === "pendente" && dueDate < today) {
            return { ...t, status: "atrasado" as const }
        }
        return t
    }), [transactions, today])

    const agendadasTransactions = useMemo(() =>
        processedTransactions.filter(t => t.status === "pendente" || t.status === "atrasado"),
        [processedTransactions]
    )

    const filteredAgendadas = useMemo(() => agendadasTransactions
        .filter((t) => filter === "todos" || t.status === filter)
        .filter((t) => typeFilter === "todos" || t.type === typeFilter)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        [agendadasTransactions, filter, typeFilter]
    )

    const groupedTransactions = useMemo(() => {
        const groups = { hoje: [] as ScheduledTransaction[], semana: [] as ScheduledTransaction[], quinzena: [] as ScheduledTransaction[], futuro: [] as ScheduledTransaction[] };
        filteredAgendadas.forEach((t: any) => {
            const d = new Date(t.dueDate)
            d.setHours(0, 0, 0, 0)
            const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays === 0) groups.hoje.push(t)
            else if (diffDays > 0 && diffDays <= 7) groups.semana.push(t)
            else if (diffDays > 7 && diffDays <= 15) groups.quinzena.push(t)
            else groups.futuro.push(t)
        })
        return groups
    }, [filteredAgendadas, today])

    const agendadasSummary = useMemo(() => {
        const income = filteredAgendadas.filter(t => t.type === "ganho").reduce((sum, t) => sum + t.amount, 0)
        const expenses = filteredAgendadas.filter(t => t.type === "pagamento").reduce((sum, t) => sum + t.amount, 0)
        return { income, expenses, balance: income - expenses }
    }, [filteredAgendadas])

    // ── CASH FLOW PROJECTION (30 DAYS) ──────────────────────────────
    const projectionData = useMemo(() => Array.from({ length: BUSINESS_RULES.CASH_FLOW_PROJECTION_DAYS }).map((_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().split("T")[0]
        const dayTransactions = processedTransactions.filter(t => (t.status === "pendente" || t.status === "atrasado") && t.dueDate <= dateStr)
        const balance = dayTransactions.reduce((acc, t) => acc + (t.type === "ganho" ? t.amount : -t.amount), 0)
        return {
            name: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            saldo: balance,
            originalDate: dateStr
        }
    }), [today, processedTransactions])

    // ── HISTORY TAB (Logical Processing) ───────────────────────────
    const getPeriodMs = useMemo(() => (): number => {
        if (periodFilter === "7d") return 7 * 24 * 60 * 60 * 1000
        if (periodFilter === "30d") return 30 * 24 * 60 * 60 * 1000
        if (periodFilter === "3m") return 90 * 24 * 60 * 60 * 1000
        return Infinity
    }, [periodFilter])

    const historyTransactions = useMemo(() => processedTransactions
        .filter((t) => {
            if (t.status !== "pago") return false
            if (typeFilter !== "todos" && t.type !== typeFilter) return false
            if (getPeriodMs() === Infinity) return true
            const txDate = new Date(t.dueDate)
            return today.getTime() - txDate.getTime() <= getPeriodMs()
        })
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
        [processedTransactions, typeFilter, getPeriodMs, today]
    )

    const historySummary = useMemo(() => {
        const income = historyTransactions.filter(t => t.type === "ganho").reduce((sum, t) => sum + t.amount, 0)
        const expenses = historyTransactions.filter(t => t.type === "pagamento").reduce((sum, t) => sum + t.amount, 0)
        return { income, expenses, balance: income - expenses }
    }, [historyTransactions])

    // ── HANDLERS ──────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.name || form.amount <= 0) return
        setIsSubmitting(true)
        try {
            await new Promise(r => setTimeout(r, 400))
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

    const handleBatchPay = () => {
        selectedIds.forEach(id => {
            const t = transactions.find(tx => tx.id === id)
            if (t?.status === "pendente" || t?.status === "atrasado") {
                markAsPaid(id)
            }
        })
        setSelectedIds(new Set())
        toast({ title: "Transações marcadas como pagas" })
    }

    const handleBatchDelete = () => {
        selectedIds.forEach(id => deleteTransaction(id))
        setSelectedIds(new Set())
        toast({ title: "Transações excluídas" })
    }

    const handleExportCSV = () => {
        const data = activeTab === "agendadas" ? agendadasTransactions : historyTransactions
        if (data.length === 0) return

        const headers = ["Nome", "Valor", "Tipo", "Data", "Recorrência", "Status", "Categoria", "Banco"]
        const rows = data.map(t => [
            t.name,
            t.amount.toString(),
            t.type,
            t.dueDate,
            t.recurrence,
            t.status,
            getCategoryNameSafe(t.categoryId) || "",
            getBankByIdSafe(t.bankId || 0)?.name || ""
        ])

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `valore-transacoes-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const getBankByIdSafe = (id: number) => banks.find(b => b.id === id)
    const getCategoryNameSafe = (id?: number) => categories.find(c => c.id === id)?.name || null

    return (
        <div className="min-h-screen bg-background transition-theme pb-20 sm:pb-0">
            {/* Floating Batch Actions */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, x: "-50%" }}
                        animate={{ y: 0, opacity: 1, x: "-50%" }}
                        exit={{ y: 100, opacity: 0, x: "-50%" }}
                        className="fixed bottom-6 left-1/2 bg-card border border-border shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-full px-6 py-3 flex items-center gap-4 z-50 backdrop-blur-xl w-[90%] sm:w-auto"
                    >
                        <span className="text-sm font-bold whitespace-nowrap">{selectedIds.size} selecionada{selectedIds.size !== 1 && 's'}</span>
                        <div className="w-px h-4 bg-border shrink-0"></div>
                        {Array.from(selectedIds).some(id => {
                            const t = transactions.find(tx => tx.id === id);
                            return t?.status === "pendente" || t?.status === "atrasado";
                        }) && (
                                <Button variant="ghost" size="sm" onClick={handleBatchPay} className="text-success hover:text-success hover:bg-success/10 text-xs sm:text-sm h-8 rounded-full">
                                    <Check className="w-4 h-4 mr-1 sm:mr-2" /> Pagar
                                </Button>
                            )}
                        <Button variant="ghost" size="sm" onClick={handleBatchDelete} className="text-danger hover:text-danger hover:bg-danger/10 text-xs sm:text-sm h-8 rounded-full">
                            <Trash2 className="w-4 h-4 mr-1 sm:mr-2" /> Excluir
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedIds(new Set())} className="text-muted-foreground h-8 w-8 rounded-full ml-auto">
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        <div>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Transações</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="border-border bg-card/50 text-foreground hover:bg-muted" onClick={handleExportCSV} title="Exportar CSV">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="border-border bg-card/50 text-foreground text-xs sm:text-sm font-semibold hover:bg-muted" onClick={() => setOfxOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" /> Importar
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-lg shadow-primary/20" onClick={() => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" /> Nova Transação
                        </Button>
                    </div>
                </div>
            </header>

            <DemoBanner />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <SummaryCards
                    income={activeTab === "agendadas" ? agendadasSummary.income : historySummary.income}
                    expenses={activeTab === "agendadas" ? agendadasSummary.expenses : historySummary.expenses}
                    balance={activeTab === "agendadas" ? agendadasSummary.balance : historySummary.balance}
                    activeTab={activeTab}
                    isPrivate={settings.isPrivate}
                />

                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl mb-6 w-full sm:w-auto sm:inline-flex">
                    <button onClick={() => setActiveTab("agendadas")} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center", activeTab === "agendadas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <ListTodo className="h-4 w-4" /> Agendadas
                    </button>
                    <button onClick={() => setActiveTab("historico")} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center", activeTab === "historico" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <History className="h-4 w-4" /> Histórico
                    </button>
                </div>

                {activeTab === "agendadas" ? (
                    <div className="space-y-4">
                        <TransactionFilters
                            activeTab="agendadas"
                            filter={filter} setFilter={setFilter as any}
                            typeFilter={typeFilter} setTypeFilter={setTypeFilter as any}
                            showFilters={showFilters} setShowFilters={setShowFilters}
                            periodFilter={periodFilter} setPeriodFilter={setPeriodFilter}
                        />
                        <ProjectionChart data={projectionData} />

                        {filteredAgendadas.length === 0 ? (
                            <EmptyState
                                icon={ListTodo}
                                title="Nenhuma transação futura"
                                description="Suas contas a pagar e receber aparecerão aqui para ajudar você a prever seu saldo."
                                actionLabel="Adicionar Agora"
                                onAction={() => setDialogOpen(true)}
                            />
                        ) : (
                            <TransactionList
                                transactions={filteredAgendadas}
                                groupedTransactions={groupedTransactions}
                                getBankById={getBankByIdSafe}
                                getCategoryName={getCategoryNameSafe}
                                onMarkAsPaid={markAsPaid}
                                onEdit={handleEdit}
                                onDelete={(id) => { setTransactionToDelete(id); setConfirmOpen(true); }}
                                selectedIds={selectedIds}
                                toggleSelection={(id) => {
                                    const next = new Set(selectedIds);
                                    if (next.has(id)) next.delete(id); else next.add(id);
                                    setSelectedIds(next);
                                }}
                                isPrivate={settings.isPrivate}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <TransactionFilters
                            activeTab="historico"
                            filter={filter} setFilter={setFilter as any}
                            typeFilter={typeFilter} setTypeFilter={setTypeFilter as any}
                            showFilters={showFilters} setShowFilters={setShowFilters}
                            periodFilter={periodFilter} setPeriodFilter={setPeriodFilter}
                        />
                        {historyTransactions.length === 0 ? (
                            <EmptyState
                                icon={History}
                                title="Sem registros"
                                description="Marque transações agendadas como pagas para começar a construir seu histórico."
                            />
                        ) : (
                            <TransactionList
                                isHistory
                                transactions={historyTransactions}
                                getBankById={getBankByIdSafe}
                                getCategoryName={getCategoryNameSafe}
                                onMarkAsPaid={markAsPaid}
                                onEdit={handleEdit}
                                onDelete={(id) => { setTransactionToDelete(id); setConfirmOpen(true); }}
                                selectedIds={selectedIds}
                                toggleSelection={(id) => {
                                    const next = new Set(selectedIds);
                                    if (next.has(id)) next.delete(id); else next.add(id);
                                    setSelectedIds(next);
                                }}
                                isPrivate={settings.isPrivate}
                            />
                        )}
                    </div>
                )}
            </main>

            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                form={form} setForm={setForm}
                editingId={editingId}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                banks={banks}
                categories={categories}
                onNewCategory={() => { }}
            />

            <OfxImporter open={ofxOpen} onOpenChange={setOfxOpen} />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Excluir Transação?"
                description="Tem certeza? Esta transação será removida permanentemente do seu histórico."
                onConfirm={() => {
                    if (transactionToDelete) {
                        deleteTransaction(transactionToDelete)
                        toast({ title: "Transação removida" })
                    }
                    setConfirmOpen(false)
                }}
            />
        </div>
    )
}
