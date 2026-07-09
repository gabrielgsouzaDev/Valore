"use client"

/**
 * useBudgetSummary.ts
 *
 * Cálculos derivados do orçamento.
 * Sem estado, sem efeitos colaterais — apenas memoização de dados.
 *
 * Separado do useEconomy para:
 *   1. Testabilidade isolada dos cálculos
 *   2. Reutilização em outros contextos (ex: dashboard)
 *   3. Clareza de responsabilidade
 */

import { useMemo } from "react"
import { calculateTotalBudgeted, calculateTotalSpent } from "@/lib/services"
import type { Category } from "@/lib/types"

// ── Tipos ────────────────────────────────────────────────────────────────────

/*
 * SummarySettings — tipado minimamente para não criar dependência
 * circular com o tipo completo de Settings. Apenas os campos
 * consumidos por este hook são declarados.
 */
interface SummarySettings {
  rendaMensal?: number
  activeModules?: {
    investimentos?: boolean
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBudgetSummary(
  categories: Category[],
  settings: SummarySettings
) {

  const totalBudgeted = useMemo(
    () => calculateTotalBudgeted(categories),
    [categories]
  )

  const totalSpent = useMemo(
    () => calculateTotalSpent(categories),
    [categories]
  )

  /*
   * remaining — diferença entre orçado e gasto.
   * Pode ser negativo se o gasto ultrapassar o orçado.
   * Usado para: cor do valor disponível, link de investimento.
   */
  const remaining = useMemo(
    () => totalBudgeted - totalSpent,
    [totalBudgeted, totalSpent]
  )

  /*
   * rendaMensal — fallback para 0 se não configurado.
   * Exibido nas métricas secundárias da sidebar e do sheet mobile.
   */
  const rendaMensal = settings.rendaMensal ?? 0

  /*
   * hasInvestmentsEnabled — módulo de investimentos habilitado.
   * Controla visibilidade do botão "Investir Sobra".
   * Padrão true quando activeModules não está definido.
   */
  const hasInvestmentsEnabled =
    settings.activeModules?.investimentos !== false

  return {
    totalBudgeted,
    totalSpent,
    remaining,
    rendaMensal,
    hasInvestmentsEnabled,
  }
}