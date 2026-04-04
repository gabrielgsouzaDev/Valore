"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "agendadas" | "historico"
type PeriodFilter = "7d" | "30d" | "3m" | "todos"

interface TransactionFiltersProps {
    /** Aba ativa atualmente (agendadas ou histórico). */
    activeTab: Tab
    /** Filtro de status para a aba agendadas. */
    filter: "todos" | "pendente" | "pago"
    /** Callback para atualizar o filtro de status. */
    setFilter: (val: "todos" | "pendente" | "pago") => void
    /** Filtro de tipo (entrada/saída). */
    typeFilter: "todos" | "pagamento" | "ganho"
    /** Callback para atualizar o filtro de tipo. */
    setTypeFilter: (val: "todos" | "pagamento" | "ganho") => void
    /** Filtro de período para a aba histórico. */
    periodFilter: PeriodFilter
    /** Callback para atualizar o filtro de período. */
    setPeriodFilter: (val: PeriodFilter) => void
    /** Indica se os filtros mobile estão visíveis. */
    showFilters: boolean
    /** Callback para alternar a visibilidade dos filtros mobile. */
    setShowFilters: (val: boolean) => void
}

/**
 * Componente de filtros para a listagem de transações.
 * Adapta as opções disponíveis com base na aba ativa.
 */
export function TransactionFilters({
    activeTab,
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    periodFilter,
    setPeriodFilter,
    showFilters,
    setShowFilters
}: TransactionFiltersProps) {
    if (activeTab === "agendadas") {
        return (
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden border-border bg-transparent text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1" /> Filtros
                </Button>
                <div className={cn("flex-wrap gap-2", showFilters ? "flex" : "hidden lg:flex", "w-full lg:w-auto")}>
                    <Select value={filter} onValueChange={(v) => setFilter(v as "todos" | "pendente" | "pago")}>
                        <SelectTrigger className="w-full sm:w-36 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="todos">Todos Status</SelectItem>
                            <SelectItem value="pendente">Pendentes</SelectItem>
                            <SelectItem value="pago">Pagos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "todos" | "pagamento" | "ganho")}>
                        <SelectTrigger className="w-full sm:w-36 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9">
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
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                {(["7d", "30d", "3m", "todos"] as PeriodFilter[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriodFilter(p)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            periodFilter === p
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {p === "todos" ? "Tudo" : p.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="flex-1" />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-36 bg-card border-border text-foreground text-xs sm:text-sm h-8 sm:h-9">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                    <SelectItem value="todos">Todos Tipos</SelectItem>
                    <SelectItem value="ganho">Ganhos</SelectItem>
                    <SelectItem value="pagamento">Pagamentos</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
