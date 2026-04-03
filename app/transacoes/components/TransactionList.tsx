"use client"

import { ScheduledTransaction } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check, ArrowUpCircle, ArrowDownCircle, Repeat, Building2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency, formatDate } from "@/lib/services"

interface TransactionListProps {
    transactions: ScheduledTransaction[]
    getBankById: (id: number) => any
    getCategoryName: (id?: number) => string | null
    onMarkAsPaid: (id: number) => void
    onEdit: (t: ScheduledTransaction) => void
    onDelete: (id: number) => void
    selectedIds: Set<number>
    toggleSelection: (id: number) => void
    isPrivate?: boolean
    groupedTransactions?: Record<string, ScheduledTransaction[]>
    isHistory?: boolean
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

function TransactionRow({
    transaction,
    index,
    selected,
    toggle,
    bank,
    categoryName,
    onMarkAsPaid,
    onEdit,
    onDelete,
    isPrivate
}: any) {
    const isAtrasado = transaction.status === "atrasado"
    const isImported = transaction.notes?.includes("[IMPORTADO]")

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index || 0) * 0.05 }}
            className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all gap-3 group relative cursor-pointer",
                isAtrasado
                    ? "bg-danger/5 border-danger/20"
                    : "bg-card border-border/50 hover:border-primary/30",
                selected && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => toggle(transaction.id)}
        >
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <button
                        className={cn(
                            "w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors pointer-events-none",
                            selected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground/30 group-hover:border-primary/50'
                        )}
                    >
                        {selected && <Check className="w-3 h-3" />}
                    </button>
                </div>

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
                        {isImported ? (
                            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-primary/10 rounded text-primary flex items-center gap-1 font-semibold">
                                <Building2 className="h-2.5 w-2.5" /> Bancário
                            </span>
                        ) : (
                            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground flex items-center gap-1 font-semibold">
                                <Pencil className="h-2.5 w-2.5" /> Manual
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-6 border-t sm:border-t-0 border-border/10 pt-2 sm:pt-0">
                <div className="flex items-center gap-3">
                    <span className={cn("text-base sm:text-lg font-black tracking-tighter",
                        transaction.type === "ganho" ? "text-success" : "text-danger",
                        isPrivate && "blur-md select-none pointer-events-none opacity-40"
                    )}>
                        {transaction.type === "ganho" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </span>
                    <span className={cn("text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full capitalize font-bold tracking-widest uppercase", getStatusColor(transaction.status))}>
                        {transaction.status}
                    </span>
                </div>

                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {(transaction.status === "pendente" || transaction.status === "atrasado") && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-success/20 hover:text-success transition-all rounded-xl" onClick={() => onMarkAsPaid(transaction.id)}>
                            <Check className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all rounded-xl" onClick={() => onEdit(transaction)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-danger/20 hover:text-danger transition-all rounded-xl" onClick={() => onDelete(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

export function TransactionList({
    transactions,
    getBankById,
    getCategoryName,
    onMarkAsPaid,
    onEdit,
    onDelete,
    selectedIds,
    toggleSelection,
    isPrivate,
    groupedTransactions,
    isHistory = false
}: TransactionListProps) {

    if (isHistory) {
        return (
            <div className="space-y-2 sm:space-y-3">
                <AnimatePresence mode="popLayout">
                    {transactions.map((t, idx) => (
                        <TransactionRow
                            key={t.id}
                            transaction={t}
                            index={idx}
                            selected={selectedIds.has(t.id)}
                            toggle={toggleSelection}
                            bank={t.bankId ? getBankById(t.bankId) : null}
                            categoryName={getCategoryName(t.categoryId)}
                            onMarkAsPaid={onMarkAsPaid}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isPrivate={isPrivate}
                        />
                    ))}
                </AnimatePresence>
            </div>
        )
    }

    if (!groupedTransactions) return null

    return (
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
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                        index={idx}
                                        selected={selectedIds.has(transaction.id)}
                                        toggle={toggleSelection}
                                        bank={transaction.bankId ? getBankById(transaction.bankId) : null}
                                        categoryName={getCategoryName(transaction.categoryId)}
                                        onMarkAsPaid={onMarkAsPaid}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        isPrivate={isPrivate}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
