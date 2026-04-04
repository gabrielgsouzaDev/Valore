"use client"

import { useGoals } from "./hooks/useGoals"
import { Button } from "@/components/ui/button"
import { DemoBanner } from "@/components/demo-banner"
import { Plus, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoalDialog } from "@/components/goal-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Subcomponêntes Locais
import { GoalHeader } from "./components/GoalHeader"
import { GoalList } from "./components/GoalList"
import { GoalSidebar } from "./components/GoalSidebar"

/**
 * Página de Objetivos
 * Refatorada para usar hooks customizados e componentes atômicos.
 */
export default function ObjetivosPage() {
  const {
    filteredGoals,
    totals,
    availableForInvestment,
    priorityFilter, setPriorityFilter,
    contributionAmount, setContributionAmount,
    settings,

    // Diálogos
    goalDialogOpen, setGoalDialogOpen,
    editingGoal, setEditingGoal,
    confirmOpen, setConfirmOpen,
    goalToDelete, setGoalToDelete,

    // Handlers
    handleSaveGoal,
    handleDeleteGoal,
    handleContribution,

    // Utils
    calculateMonthsRemaining,
    getMonthlyNeeded,
  } = useGoals()

  return (
    <>
      <GoalHeader totalCurrent={totals.current} totalTarget={totals.target} />
      <DemoBanner />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Conteúdo Principal */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Filtros e Ação */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Meus Objetivos</h3>
              <div className="flex items-center gap-2">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] h-9 bg-card border-border text-xs sm:text-sm">
                    <Filter className="w-3 h-3 mr-2" />
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="todos">Todas Prioridades</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="média">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            {/* Lista de Objetivos */}
            <GoalList
              goals={filteredGoals}
              contributionAmount={contributionAmount}
              onSetContribution={(id, val) => setContributionAmount(prev => ({ ...prev, [id]: val }))}
              onAddContribution={handleContribution}
              onEditGoal={(goal) => { setEditingGoal(goal); setGoalDialogOpen(true) }}
              onDeleteGoal={(id) => { setGoalToDelete(id); setConfirmOpen(true) }}
              onOpenAddDialog={() => setGoalDialogOpen(true)}
              calculateMonthsRemaining={calculateMonthsRemaining}
              getMonthlyNeeded={getMonthlyNeeded}
            />
          </div>

          {/* Sidebar de Resumo */}
          <GoalSidebar
            totals={totals}
            goals={filteredGoals}
            availableForInvestment={availableForInvestment}
            isPrivate={!!settings.isPrivate}
          />
        </div>
      </div>

      {/* Modais */}
      <GoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        goal={editingGoal}
        onSave={handleSaveGoal}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir objetivo"
        description="Esta ação não pode ser desfeita. Deseja realmente remover este objetivo?"
        variant="destructive"
        onConfirm={handleDeleteGoal}
      />
    </>
  )
}
