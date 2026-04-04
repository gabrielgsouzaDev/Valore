"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Target, Pencil, Trash2, PlusCircle, Calendar, TrendingUp, DollarSign } from "lucide-react"
import { getGoalBarColor, formatCurrency } from "@/lib/services"
import type { Goal } from "@/lib/types"

interface GoalListProps {
    goals: Goal[]
    contributionAmount: { [key: number]: string }
    onSetContribution: (id: number, amount: string) => void
    onAddContribution: (id: number) => void
    onEditGoal: (goal: Goal) => void
    onDeleteGoal: (id: number) => void
    onOpenAddDialog: () => void
    calculateMonthsRemaining: (deadline: string) => number
    getMonthlyNeeded: (target: number, current: number, deadline: string) => number
}

const getPriorityStyles = (priority: string) => {
    switch (priority) {
        case "alta":
            return { color: "var(--danger)", borderColor: "var(--danger)" }
        case "média":
            return { color: "var(--warning)", borderColor: "var(--warning)" }
        case "baixa":
            return { color: "var(--success)", borderColor: "var(--success)" }
        default:
            return { color: "var(--muted-foreground)", borderColor: "var(--border)" }
    }
}

export function GoalList({
    goals,
    contributionAmount,
    onSetContribution,
    onAddContribution,
    onEditGoal,
    onDeleteGoal,
    onOpenAddDialog,
    calculateMonthsRemaining,
    getMonthlyNeeded
}: GoalListProps) {
    if (goals.length === 0) {
        return (
            <EmptyState
                icon={Target}
                title="Nenhum objetivo encontrado"
                description="Ajuste os filtros ou crie um novo objetivo para começar."
                actionLabel="Criar Meu Primeiro Objetivo"
                onAction={onOpenAddDialog}
            />
        )
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {goals.map((goal) => {
                const percentage = (goal.current / goal.target) * 100
                const monthsRemaining = calculateMonthsRemaining(goal.deadline)
                const monthlyNeeded = getMonthlyNeeded(goal.target, goal.current, goal.deadline)

                return (
                    <Card key={goal.id} className="bg-card border-border p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                                        <h4 className="text-base sm:text-lg font-semibold text-foreground truncate">
                                            {goal.name}
                                        </h4>
                                        <span
                                            className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase border bg-transparent transition-theme"
                                            style={getPriorityStyles(goal.priority)}
                                        >
                                            {goal.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{goal.category}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                        onClick={() => onEditGoal(goal)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onDeleteGoal(goal.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-danger rounded-md"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary hidden sm:block" />
                                </div>
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                    <span className="text-xs sm:text-sm text-muted-foreground">Progresso</span>
                                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 sm:h-3 mt-1.5 sm:mt-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            backgroundColor: getGoalBarColor(goal.current, goal.target, goal.monthlyContribution, monthlyNeeded)
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                                    <span className="text-xs sm:text-sm text-foreground/80">
                                        {formatCurrency(goal.current)}
                                    </span>
                                    <span className="text-xs sm:text-sm text-foreground/80">{formatCurrency(goal.target)}</span>
                                </div>
                            </div>

                            {/* Contribution Input */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-2 border-t border-border">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
                                        R$
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="Valor do aporte"
                                        value={contributionAmount[goal.id] || ""}
                                        onChange={(e) => onSetContribution(goal.id, e.target.value)}
                                        className="w-full pl-8 sm:pl-10 pr-3 py-2 bg-muted border border-border rounded-lg text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <Button
                                    onClick={() => onAddContribution(goal.id)}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                                >
                                    <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                                    Aportar
                                </Button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-border">
                                <div>
                                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">Prazo</span>
                                    </div>
                                    <p className="text-xs sm:text-sm font-semibold text-foreground">{monthsRemaining} meses</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">Mensal</span>
                                    </div>
                                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                                        {formatCurrency(goal.monthlyContribution)}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">Necessário</span>
                                    </div>
                                    <p
                                        className="text-xs sm:text-sm font-semibold"
                                        style={{
                                            color: monthlyNeeded > goal.monthlyContribution ? "var(--danger)" : "var(--success)",
                                        }}
                                    >
                                        {formatCurrency(monthlyNeeded)}
                                    </p>
                                </div>
                            </div>

                            {/* Alert */}
                            {monthlyNeeded > goal.monthlyContribution * 1.05 && (
                                <div className="rounded-lg p-2 sm:p-3 border bg-danger/10 border-danger/20">
                                    <p className="text-[10px] sm:text-xs font-medium text-danger">
                                        Aporte insuficiente. Aumente em {formatCurrency(monthlyNeeded - goal.monthlyContribution)}/mês
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
