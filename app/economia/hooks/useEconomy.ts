"use client"

/**
 * useEconomy.ts
 *
 * Hook orquestrador do módulo Economia.
 *
 * Responsabilidade: conectar a camada de dados (useApp + useLiveDb)
 * com a camada de UI (page.tsx), delegando:
 *   - Cálculos derivados → useBudgetSummary
 *   - CRUD e estado de dialogs → useCategoryActions
 *
 * O que permanece aqui:
 *   - Acesso aos dados reativos (liveCategories, liveSettings)
 *   - Normalização dos dados brutos (fallbacks, defaults)
 *   - Re-exportação composta para o page.tsx consumir um único hook
 */

import { useApp } from "@/contexts/app-context"
import { useLiveDb } from "@/hooks/useLiveDb"
import { defaultSettings } from "@/lib/constants"
import type { Category } from "@/lib/types"

import { useBudgetSummary } from "./useBudgetSummary"
import { useCategoryActions } from "./useCategoryActions"

export function useEconomy() {

  // ── Dados Reativos ──────────────────────────────────────────────────────
  const {
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useApp()

  const {
    categories: liveCategories,
    settings: liveSettings,
    isLoaded,
  } = useLiveDb()

  // Normalização com fallbacks
  const categories: Category[] = liveCategories || []
  const settings = liveSettings || defaultSettings
  const isLoading = !isLoaded

  // ── Cálculos Derivados ──────────────────────────────────────────────────
  const summary = useBudgetSummary(categories, settings)

  // ── Ações e Estado de UI ────────────────────────────────────────────────
  const actions = useCategoryActions({
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  })

  // ── Composição Final ────────────────────────────────────────────────────
  return {
    // Dados brutos
    categories,
    settings,
    isLoading,

    // Derivados do useBudgetSummary
    ...summary,

    // Handlers e estado de UI do useCategoryActions
    ...actions,
  }
}