"use client"

import { useState, useMemo, useCallback } from "react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { BUSINESS_RULES } from "@/lib/business-constants"
import type { ScheduledTransaction } from "@/lib/types"

// ─── Tipos Locais ──────────────────────────────────────────────────────────────

type Tab = "agendadas" | "historico"
type StatusFilter = "todos" | "pendente" | "pago"
type TypeFilter = "todos" | "pagamento" | "ganho"
type PeriodFilter = "7d" | "30d" | "3m" | "todos"

/** Formulário de criação/edição de transação (sem id e status). */
export type TransactionForm = Omit<ScheduledTransaction, "id" | "status">

/** Valor inicial para o formulário em branco. */
export const EMPTY_TRANSACTION_FORM: TransactionForm = {
    name: "",
    amount: 0,
    type: "pagamento",
    dueDate: new Date().toISOString().split("T")[0],
    recurrence: "mensal",
    categoryId: undefined,
    bankId: undefined,
    notes: "",
}

// ─── Dados por período em ms ───────────────────────────────────────────────────

const PERIOD_MS: Record<PeriodFilter, number> = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "3m": 90 * 24 * 60 * 60 * 1000,
    "todos": Infinity,
}

// ─── Hook Principal ────────────────────────────────────────────────────────────

/**
 * Hook de negócio para o módulo de Transações.
 *
 * Centraliza toda a lógica de filtragem, agrupamento, exportação e
 * ações de CRUD, mantendo o componente de UI como composição pura.
 *
 * @returns Estado derivado, filtros, handlers e dados para projeção.
 */
export function useTransactions() {
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
    const { toast } = useToast()

    // ── Estado de UI ──────────────────────────────────────────────────────────

    const [activeTab, setActiveTab] = useState<Tab>("agendadas")
    const [form, setForm] = useState<TransactionForm>(EMPTY_TRANSACTION_FORM)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos")
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos")
    const [showFilters, setShowFilters] = useState(false)
    const [ofxOpen, setOfxOpen] = useState(false)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

    /** Data atual normalizada para meia-noite, estável entre renders. */
    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    // ── Troca de aba com reset de filtros (fix G2) ────────────────────────────

    const handleTabChange = useCallback((tab: Tab) => {
        setActiveTab(tab)
        setStatusFilter("todos")
        setTypeFilter("todos")
        setSelectedIds(new Set())
    }, [])

    // ── Processamento Centralizado de Status ──────────────────────────────────

    /**
     * Enriquece as transações com status `"atrasado"` para exibição.
     * Nunca persiste essa alteração — é apenas uma derivação de estado.
     */
    const processedTransactions = useMemo(() =>
        transactions.map((t) => {
            const due = new Date(t.dueDate)
            due.setHours(0, 0, 0, 0)
            if (t.status === "pendente" && due < today) {
                return { ...t, status: "atrasado" as const }
            }
            return t
        }),
        [transactions, today]
    )

    // ── Aba: Agendadas ────────────────────────────────────────────────────────

    const agendadasTransactions = useMemo(() =>
        processedTransactions.filter(t => t.status === "pendente" || t.status === "atrasado"),
        [processedTransactions]
    )

    const filteredAgendadas = useMemo(() =>
        agendadasTransactions
            .filter(t => statusFilter === "todos" || t.status === statusFilter)
            .filter(t => typeFilter === "todos" || t.type === typeFilter)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        [agendadasTransactions, statusFilter, typeFilter]
    )

    const groupedTransactions = useMemo(() => {
        const groups = {
            hoje: [] as ScheduledTransaction[],
            semana: [] as ScheduledTransaction[],
            quinzena: [] as ScheduledTransaction[],
            futuro: [] as ScheduledTransaction[],
        }
        filteredAgendadas.forEach(t => {
            const d = new Date(t.dueDate)
            d.setHours(0, 0, 0, 0)
            const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            if (diff === 0) groups.hoje.push(t)
            else if (diff > 0 && diff <= 7) groups.semana.push(t)
            else if (diff > 7 && diff <= 15) groups.quinzena.push(t)
            else groups.futuro.push(t)
        })
        return groups
    }, [filteredAgendadas, today])

    const agendadasSummary = useMemo(() => {
        const income = filteredAgendadas
            .filter(t => t.type === "ganho")
            .reduce((sum, t) => sum + t.amount, 0)
        const expenses = filteredAgendadas
            .filter(t => t.type === "pagamento")
            .reduce((sum, t) => sum + t.amount, 0)
        return { income, expenses, balance: income - expenses }
    }, [filteredAgendadas])

    // ── Projeção de Fluxo de Caixa (30 dias) ─────────────────────────────────

    const projectionData = useMemo(() =>
        Array.from({ length: BUSINESS_RULES.CASH_FLOW_PROJECTION_DAYS }).map((_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dateStr = date.toISOString().split("T")[0]
            const dayTx = processedTransactions.filter(
                t => (t.status === "pendente" || t.status === "atrasado") && t.dueDate <= dateStr
            )
            return {
                name: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                saldo: dayTx.reduce((acc, t) => acc + (t.type === "ganho" ? t.amount : -t.amount), 0),
                originalDate: dateStr,
            }
        }),
        [today, processedTransactions]
    )

    // ── Aba: Histórico ────────────────────────────────────────────────────────

    /**
     * Duração do período filtrado em milissegundos.
     * Retorna `Infinity` para "todos".
     */
    const periodMs = useMemo(() => PERIOD_MS[periodFilter], [periodFilter])

    const historyTransactions = useMemo(() =>
        processedTransactions
            .filter(t => {
                if (t.status !== "pago") return false
                if (typeFilter !== "todos" && t.type !== typeFilter) return false
                if (periodMs === Infinity) return true
                return today.getTime() - new Date(t.dueDate).getTime() <= periodMs
            })
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
        [processedTransactions, typeFilter, periodMs, today]
    )

    const historySummary = useMemo(() => {
        const income = historyTransactions
            .filter(t => t.type === "ganho")
            .reduce((sum, t) => sum + t.amount, 0)
        const expenses = historyTransactions
            .filter(t => t.type === "pagamento")
            .reduce((sum, t) => sum + t.amount, 0)
        return { income, expenses, balance: income - expenses }
    }, [historyTransactions])

    // ── Utilitários DRY ───────────────────────────────────────────────────────

    /**
     * Lookup de banco por ID, delegado ao contexto.
     * Evita reimplementação local com `banks.find(...)`. (fix D2)
     */
    const getCategoryName = useCallback(
        (id?: number) => categories.find(c => c.id === id)?.name ?? null,
        [categories]
    )

    // ── Handlers de CRUD ──────────────────────────────────────────────────────

    const handleSubmit = useCallback(async () => {
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
            setForm(EMPTY_TRANSACTION_FORM)
            setEditingId(null)
            setDialogOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }, [form, editingId, addTransaction, updateTransaction, toast])

    /**
     * Abre o dialog de edição apenas para transações não liquidadas.
     * Transações com status `"pago"` são bloqueadas. (fix B4)
     */
    const handleEdit = useCallback((transaction: ScheduledTransaction) => {
        if (transaction.status === "pago") return
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
    }, [])

    const handleDeleteRequest = useCallback((id: number) => {
        setTransactionToDelete(id)
        setConfirmOpen(true)
    }, [])

    const handleDeleteConfirm = useCallback(() => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete)
            toast({ title: "Transação removida" })
        }
        setConfirmOpen(false)
    }, [transactionToDelete, deleteTransaction, toast])

    const toggleSelection = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    /**
     * Marca em lote apenas as transações pendentes/atrasadas.
     * Ignora as já quitadas e exibe toast somente se alguma foi processada. (fix G3)
     */
    const handleBatchPay = useCallback(() => {
        let paidCount = 0
        selectedIds.forEach(id => {
            const t = transactions.find(tx => tx.id === id)
            if (t?.status === "pendente" || t?.status === "atrasado") {
                markAsPaid(id)
                paidCount++
            }
        })
        setSelectedIds(new Set())
        if (paidCount > 0) {
            toast({ title: `${paidCount} transaç${paidCount === 1 ? "ão marcada" : "ões marcadas"} como paga${paidCount === 1 ? "" : "s"}` })
        }
    }, [selectedIds, transactions, markAsPaid, toast])

    const handleBatchDelete = useCallback(() => {
        selectedIds.forEach(id => deleteTransaction(id))
        setSelectedIds(new Set())
        toast({ title: "Transações excluídas" })
    }, [selectedIds, deleteTransaction, toast])

    /**
     * Exporta as transações do filtro atual para CSV.
     * Revoga o ObjectURL após o download para evitar memory leak. (fix G1)
     */
    const handleExportCSV = useCallback(() => {
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
            getCategoryName(t.categoryId) ?? "",
            getBankById(t.bankId ?? 0)?.name ?? "",
        ])

        const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `valore-transacoes-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url) // (fix G1) Libera referência da memória
    }, [activeTab, agendadasTransactions, historyTransactions, getCategoryName, getBankById])

    // ── Verificação de seleção elegível para "Pagar" ──────────────────────────

    const hasPayableInSelection = useMemo(() =>
        Array.from(selectedIds).some(id => {
            const t = transactions.find(tx => tx.id === id)
            return t?.status === "pendente" || t?.status === "atrasado"
        }),
        [selectedIds, transactions]
    )

    return {
        // Estado
        activeTab, handleTabChange,
        form, setForm,
        editingId,
        dialogOpen, setDialogOpen,
        statusFilter, setStatusFilter,
        typeFilter, setTypeFilter,
        showFilters, setShowFilters,
        ofxOpen, setOfxOpen,
        periodFilter, setPeriodFilter,
        confirmOpen,
        isSubmitting,
        selectedIds,
        hasPayableInSelection,
        // Dados derivados
        filteredAgendadas,
        groupedTransactions,
        agendadasSummary,
        projectionData,
        historyTransactions,
        historySummary,
        // Utilitários
        getBankById,
        getCategoryName,
        settings,
        banks,
        categories,
        markAsPaid,
        // Handlers
        handleSubmit,
        handleEdit,
        handleDeleteRequest,
        handleDeleteConfirm,
        toggleSelection,
        handleBatchPay,
        handleBatchDelete,
        handleExportCSV,
    }
}
