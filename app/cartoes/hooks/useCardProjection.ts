"use client"

import { useState, useMemo, useCallback } from "react"
import { useLiveDb } from "@/hooks/useLiveDb"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/services"
import { BUSINESS_RULES } from "@/lib/business-constants"
import type { CreditCard, CardExpense, Bank } from "@/lib/types"

// ─── Tipos Exportados ──────────────────────────────────────────────────────────

/** Dados normalizados para cada mês na projeção de faturas. */
export type ProjectionMonth = {
    /** Rótulo exibido no eixo X do gráfico (ex: "Abr"). */
    name: string
    /** Total de parcelas vencendo neste mês. */
    total: number
    /** Breakdown de valores por nome de cartão. */
    breakdown: Record<string, number>
}

// ─── Hook Principal ────────────────────────────────────────────────────────────

/**
 * Hook de negócio para o módulo de Cartões de Crédito.
 *
 * Centraliza a lógica de projeção mensal de faturas, cálculo de limite
 * disponível real e sincronização de estado com o gráfico interativo.
 * Integrado com IndexedDB (Dexie) para reatividade total.
 *
 * @returns Dados de projeção, estado de seleção de mês e utilitários.
 */
export function useCardProjection() {
    const { creditCards: liveCards, cardExpenses: liveExpenses, banks: liveBanks, isLoaded } = useLiveDb()
    const { toast } = useToast()

    // ── Normalização de Dados ────────────────────────────────────────────────
    const creditCards = liveCards || []
    const cardExpenses = liveExpenses || []
    const banks = liveBanks || []
    const isLoading = !isLoaded

    /**
     * Data atual normalizada.
     */
    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    /** Índice do mês selecionado no gráfico. */
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)

    // ── Projeção de Faturas ───────────────────────────────────────────────────

    /**
     * Calcula o total de parcelas vencendo em cada mês futuro.
     * Memoizado para performance, recalcula apenas quando os gastos ou cartões mudam.
     */
    const projectionData = useMemo<ProjectionMonth[]>(() => {
        const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        const baseMonth = today.getMonth()
        const baseYear = today.getFullYear()

        return Array.from({ length: BUSINESS_RULES.INVOICE_PROJECTION_MONTHS }).map((_, i) => {
            const targetMonth = (baseMonth + i) % 12
            const targetYear = baseYear + Math.floor((baseMonth + i) / 12)

            const breakdown: Record<string, number> = {}
            let total = 0

            cardExpenses.forEach(expense => {
                const purchaseDate = new Date(expense.purchaseDate)
                const startMonth = purchaseDate.getMonth()
                const startYear = purchaseDate.getFullYear()
                const monthsDiff = (targetYear - startYear) * 12 + (targetMonth - startMonth)

                if (monthsDiff >= 0 && monthsDiff < expense.installments) {
                    const installmentValue = expense.totalAmount / expense.installments
                    total += installmentValue
                    const card = creditCards.find(c => c.id === expense.cardId)
                    const cardName = card?.name ?? "Desconhecido"
                    breakdown[cardName] = (breakdown[cardName] ?? 0) + installmentValue
                }
            })

            return { name: monthsNames[targetMonth], total, breakdown }
        })
    }, [cardExpenses, creditCards, today])

    // ── Dados do Mês Selecionado ──────────────────────────────────────────────

    const selectedMonth = useMemo(
        () => projectionData[selectedMonthIndex] ?? projectionData[0],
        [projectionData, selectedMonthIndex]
    )

    const totalProjected = useMemo(
        () => projectionData.reduce((sum, d) => sum + d.total, 0),
        [projectionData]
    )

    const averageProjected = useMemo(
        () => totalProjected / (projectionData.length || 1),
        [totalProjected, projectionData.length]
    )

    const maxMonth = useMemo(
        () => [...projectionData].sort((a, b) => b.total - a.total)[0],
        [projectionData]
    )

    // ── Limite Disponível Real ────────────────────────────────────────────────

    const getCardAvailableLimit = useCallback((card: CreditCard): number => {
        const usedLimit = cardExpenses
            .filter(e => e.cardId === card.id)
            .reduce((sum, e) => {
                const paid = e.paidInstallments ?? 0
                const remaining = e.installments - paid
                if (remaining <= 0) return sum
                const installmentValue = e.totalAmount / e.installments
                return sum + installmentValue * remaining
            }, 0)
        return Math.max(0, card.limit - usedLimit)
    }, [cardExpenses])

    // ── Utilitários ───────────────────────────────────────────────────────────

    const getBankByIdSafe = useCallback(
        (id: number) => banks.find(b => b.id === id),
        [banks]
    )

    return {
        // Estado
        creditCards,
        cardExpenses,
        banks,
        isLoading,

        // Projeção
        projectionData,
        selectedMonth,
        selectedMonthIndex,
        setSelectedMonthIndex,
        totalProjected,
        averageProjected,
        maxMonth,

        // Limite real
        getCardAvailableLimit,

        // Utilitários
        getBankByIdSafe,
        formatCurrency,
        toast,
    }
}
