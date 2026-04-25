"use client"

import { useMemo, type ReactNode } from "react"
import type { Asset, Category, Settings, CreditCard, CardExpense, Bank, ThemePreset, Subcategory, PatrimonialSnapshot, InvoiceProjection, BackupImportData } from "@/lib/types"
import { DataProvider, useData } from "./domains/data-context"
import { BudgetProvider, useBudget } from "./domains/budget-context"
import { InvestmentProvider, useInvestment } from "./domains/investment-context"
import { BankingProvider, useBanking } from "./domains/banking-context"
import { CoreProvider, useCore } from "./domains/core-context"

// Re-export applyThemeVariables for external consumers (onboarding-wizard)
export { applyThemeVariables } from "./domains/core-context"

// ─── AppContextType (interface pública do app) ───

type AppContextType = {
  // Ativos (Investimentos)
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Omit<Asset, "id" | "currentValue">) => Promise<void>
  updateAsset: (id: number, data: Partial<Asset>) => Promise<void>
  deleteAsset: (id: number) => Promise<void>

  // Categorias (Orçamento)
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => Promise<void>
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  addSubcategory: (categoryId: number, subcategory: Omit<Subcategory, "id">) => Promise<void>
  updateSubcategory: (categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => Promise<void>
  deleteSubcategory: (categoryId: number, subcategoryId: number) => Promise<void>
  toggleCategory: (id: number) => Promise<void>

  // Cartões de Crédito
  creditCards: CreditCard[]
  setCreditCards: (cards: CreditCard[]) => void
  addCreditCard: (card: Omit<CreditCard, "id">) => Promise<void>
  updateCreditCard: (id: number, data: Partial<CreditCard>) => Promise<void>
  deleteCreditCard: (id: number) => Promise<void>

  // Despesas de Cartão
  cardExpenses: CardExpense[]
  setCardExpenses: (expenses: CardExpense[]) => void
  addCardExpense: (expense: Omit<CardExpense, "id">) => Promise<void>
  updateCardExpense: (id: number, data: Partial<CardExpense>) => Promise<void>
  deleteCardExpense: (id: number) => Promise<void>

  // Bancos e Contas
  banks: Bank[]
  setBanks: (banks: Bank[]) => void
  addBank: (bank: Omit<Bank, "id">) => Promise<void>
  updateBank: (id: number, data: Partial<Bank>) => Promise<void>
  deleteBank: (id: number) => Promise<void>
  getBankById: (id: number) => Bank | undefined
  getTotalBankBalance: () => number

  // Ativos e Sincronização
  syncAssetsPrices: () => Promise<void>

  // Histórico
  patrimonialHistory: PatrimonialSnapshot[]
  savePatrimonialSnapshot: () => void

  // Cálculos de Cartão
  calculateInvoices: (cardId?: number) => InvoiceProjection[]
  getTotalCardDebt: () => number
  getCardAvailableLimit: (cardId: number) => number

  // Configurações e Temas
  settings: Settings
  updateSettings: (data: Partial<Settings>) => void
  currentTheme: ThemePreset
  setTheme: (themeId: string) => void

  // Valores Computados
  totalNetWorth: number
  totalBudgeted: number
  totalSpent: number
  availableForInvestment: number
  isLoaded: boolean

  // Utilitários de Dados
  exportData: () => void
  importData: (parsedData: BackupImportData) => Promise<void>
  clearAllData: () => void
  loadExampleData: () => void
  togglePrivacy: () => void
  isPrivate: boolean
}

// ─── Provider ───

function DomainProviders({ children }: { children: ReactNode }) {
  const dataCtx = useData()

  return (
    <BudgetProvider>
      <InvestmentProvider>
        <BankingProvider>
          <CoreProvider
            totalNetWorth={dataCtx.assets.reduce((s, a) => s + a.currentValue, 0) + dataCtx.banks.reduce((s, b) => s + b.balance, 0)}
            totalBudgeted={dataCtx.categories.reduce((s, c) => s + c.budgeted, 0)}
            totalSpent={dataCtx.categories.reduce((s, c) => s + c.spent, 0)}
          >
            {children}
          </CoreProvider>
        </BankingProvider>
      </InvestmentProvider>
    </BudgetProvider>
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <DomainProviders>{children}</DomainProviders>
    </DataProvider>
  )
}

// ─── Hook ───

export function useApp() {
  const budget = useBudget()
  const investment = useInvestment()
  const banking = useBanking()
  const core = useCore()

  return useMemo<AppContextType>(() => ({
    ...investment,
    ...budget,
    ...banking,
    ...core,
  }), [investment, budget, banking, core])
}

// Export de tipos para compatibilidade
export type { AppContextType }
