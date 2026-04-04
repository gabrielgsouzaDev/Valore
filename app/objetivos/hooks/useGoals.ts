"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { Goal } from "@/lib/types"

/**
 * Hook customizado para o módulo de Objetivos.
 * Gerencia filtros de prioridade, aportes rápidos e deriva cálculos de prazos e metas.
 */
export function useGoals() {
    const {
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        addContributionToGoal,
        availableForInvestment,
        settings
    } = useApp()
    const { toast } = useToast()

    // ── Estado de UI ──────────────────────────────────────────────────────────

    const [goalDialogOpen, setGoalDialogOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [contributionAmount, setContributionAmount] = useState<{ [key: number]: string }>({})
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [goalToDelete, setGoalToDelete] = useState<number | null>(null)
    const [priorityFilter, setPriorityFilter] = useState<string>("todos")

    // ── Filtros e Cálculos ────────────────────────────────────────────────────

    const filteredGoals = useMemo(() => {
        if (priorityFilter === "todos") return goals
        return goals.filter(g => g.priority === priorityFilter)
    }, [goals, priorityFilter])

    const totals = useMemo(() => {
        const target = goals.reduce((sum, goal) => sum + goal.target, 0)
        const current = goals.reduce((sum, goal) => sum + goal.current, 0)
        const monthly = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)
        return { target, current, monthly, remaining: target - current }
    }, [goals])

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSaveGoal = (data: Omit<Goal, "id" | "current">) => {
        if (editingGoal) {
            updateGoal(editingGoal.id, data)
            toast({ title: "Objetivo atualizado" })
        } else {
            addGoal({ ...data, current: 0 })
            toast({ title: "Objetivo adicionado" })
        }
        setGoalDialogOpen(false)
        setEditingGoal(null)
    }

    const handleDeleteGoal = () => {
        if (goalToDelete !== null) {
            deleteGoal(goalToDelete)
            setGoalToDelete(null)
            setConfirmOpen(false)
            toast({ title: "Objetivo excluído" })
        }
    }

    const handleContribution = (goalId: number) => {
        const amount = Number.parseFloat(contributionAmount[goalId] || "0")
        if (amount > 0) {
            addContributionToGoal(goalId, amount)
            setContributionAmount((prev) => ({ ...prev, [goalId]: "" }))
            toast({ title: "Aporte realizado com sucesso" })
        }
    }

    // ── Utilitários de Cálculo ────────────────────────────────────────────────

    const calculateMonthsRemaining = (deadline: string) => {
        const today = new Date()
        const target = new Date(deadline)
        const months = Math.max(
            0,
            (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()),
        )
        return months
    }

    const getMonthlyNeeded = (target: number, current: number, deadline: string) => {
        const months = calculateMonthsRemaining(deadline)
        return months > 0 ? Math.max(0, (target - current) / months) : 0
    }

    return {
        // Estado
        goals,
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
    }
}
