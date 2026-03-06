"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Plus, Target, TrendingUp, Calendar, DollarSign, Pencil, Trash2, PlusCircle } from "lucide-react"
import { GoalDialog } from "@/components/goal-dialog"
import { useApp } from "@/contexts/app-context"
import { getGoalBarColor } from "@/lib/services"
import type { Goal } from "@/lib/types"

export default function ObjetivosPage() {
  const { goals, addGoal, updateGoal, deleteGoal, addContributionToGoal, availableForInvestment } = useApp()

  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [contributionAmount, setContributionAmount] = useState<{ [key: number]: string }>({})

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0)
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.current, 0)
  const totalMonthly = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)

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

  const calculateMonthsRemaining = (deadline: string) => {
    const today = new Date()
    const target = new Date(deadline)
    const months = Math.max(
      0,
      (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()),
    )
    return months
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
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <div className="flex flex-col justify-center">
                <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Objetivos</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">
                  Projetos de vida • Metas financeiras
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right flex flex-col justify-center">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Acumulado vs Meta</p>
              <div className="flex flex-col sm:items-end">
                <p className="text-xl sm:text-3xl font-bold tracking-tight text-success">
                  {formatCurrency(totalCurrent)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  de {formatCurrency(totalTarget)} ({totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : "0"}%)
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Add Goal Button */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Meus Objetivos</h3>
                <Button
                  onClick={() => {
                    setEditingGoal(null)
                    setGoalDialogOpen(true)
                  }}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Novo Objetivo</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>

              {/* Goals List */}
              <div className="space-y-3 sm:space-y-4">
                {goals.map((goal) => {
                  const percentage = (goal.current / goal.target) * 100
                  const monthsRemaining = calculateMonthsRemaining(goal.deadline)
                  const monthlyNeeded =
                    monthsRemaining > 0 ? Math.max(0, (goal.target - goal.current) / monthsRemaining) : 0

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
                              onClick={() => {
                                setEditingGoal(goal)
                                setGoalDialogOpen(true)
                              }}
                              variant="ghost"
                              size="icon"
                              aria-label={`Editar ${goal.name}`}
                              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir este objetivo?")) {
                                  deleteGoal(goal.id)
                                }
                              }}
                              variant="ghost"
                              size="icon"
                              aria-label={`Excluir ${goal.name}`}
                              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150 rounded-md"
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

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-2 border-t border-border">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
                              R$
                            </span>
                            <input
                              type="number"
                              placeholder="Valor do aporte"
                              value={contributionAmount[goal.id] || ""}
                              onChange={(e) =>
                                setContributionAmount((prev) => ({ ...prev, [goal.id]: e.target.value }))
                              }
                              className="w-full pl-8 sm:pl-10 pr-3 py-2 bg-muted border border-border rounded-lg text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                          <Button
                            onClick={() => {
                              const amount = Number.parseFloat(contributionAmount[goal.id] || "0")
                              if (amount > 0) {
                                addContributionToGoal(goal.id, amount)
                                setContributionAmount((prev) => ({ ...prev, [goal.id]: "" }))
                              }
                            }}
                            size="sm"
                            aria-label={`Aportar em ${goal.name}`}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                          >
                            <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            Aportar
                          </Button>
                        </div>

                        {/* Stats Grid - Responsivo */}
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
                                color:
                                  monthlyNeeded > goal.monthlyContribution ? "var(--danger)" : "var(--success)",
                              }}
                            >
                              {formatCurrency(monthlyNeeded)}
                            </p>
                          </div>
                        </div>

                        {/* Alert */}
                        {monthlyNeeded > goal.monthlyContribution * 1.05 && (
                          <div
                            className="rounded-lg p-2 sm:p-3 border"
                            style={{
                              backgroundColor: "var(--danger)",
                              opacity: 0.1,
                              borderColor: "var(--danger)"
                            }}
                          >
                            <p className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--danger)" }}>
                              Aporte insuficiente. Aumente em {formatCurrency(monthlyNeeded - goal.monthlyContribution)}
                              /mês
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                <Card className="bg-card border-border p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-4">
                    Disponível p/ Investir
                  </h3>
                  <p className="text-xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">
                    {formatCurrency(Math.max(0, availableForInvestment))}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Restante da categoria Investimentos</p>
                </Card>

                {/* Overview Card */}
                <Card className="bg-card border-border p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Visão Geral</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Acumulado</p>
                      <p className="text-lg sm:text-2xl font-bold" style={{ color: "var(--success)" }}>
                        {formatCurrency(totalCurrent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Meta Total</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(totalTarget)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Falta Acumular</p>
                      <p className="text-lg sm:text-2xl font-bold text-accent">
                        {formatCurrency(totalTarget - totalCurrent)}
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0}%`,
                          backgroundColor: "var(--success)"
                        }}
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      {totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : "0.0"}% alcançado
                    </p>
                  </div>
                </Card>

                {/* Monthly Contribution */}
                <Card className="bg-card border-border p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-4">
                    Aportes Mensais
                  </h3>
                  <p className="text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                    {formatCurrency(totalMonthly)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total destinado mensalmente</p>
                </Card>

                {/* Priority Distribution */}
                <Card className="bg-card border-border p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
                    Por Prioridade
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: "var(--danger)" }}></div>
                        <span className="text-xs sm:text-sm text-foreground/80">Alta</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {goals.filter((g) => g.priority === "alta").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: "var(--warning)" }}></div>
                        <span className="text-xs sm:text-sm text-foreground/80">Média</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {goals.filter((g) => g.priority === "média").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: "var(--success)" }}></div>
                        <span className="text-xs sm:text-sm text-foreground/80">Baixa</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {goals.filter((g) => g.priority === "baixa").length}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        goal={editingGoal}
        onSave={(data) => {
          if (editingGoal) {
            updateGoal(editingGoal.id, data)
            setEditingGoal(null)
          } else {
            addGoal(data)
          }
          setGoalDialogOpen(false)
        }}
      />
    </div>
  )
}
