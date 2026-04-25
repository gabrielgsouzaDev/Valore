"use client"
import { createContext, useContext, useMemo, useCallback } from "react"
import { Category, ScheduledTransaction, Subcategory } from "@/lib/types"
import { calculateTotalBudgeted, calculateTotalSpent } from "@/lib/services"
import { useCategoryActions } from "@/contexts/hooks/use-actions"
import { useData } from "./data-context"

type BudgetContextType = {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => Promise<void>
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  addSubcategory: (categoryId: number, subcategory: Omit<Subcategory, "id">) => Promise<void>
  updateSubcategory: (categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => Promise<void>
  deleteSubcategory: (categoryId: number, subcategoryId: number) => Promise<void>
  toggleCategory: (id: number) => Promise<void>
  totalBudgeted: number
  totalSpent: number
  availableForInvestment: number
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { categories, isLoaded } = useData()
  const noopCat: React.Dispatch<React.SetStateAction<Category[]>> = () => {}
  const setTxStateNoop: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>> = () => {}
  const { addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory } = useCategoryActions(
    categories, noopCat, setTxStateNoop
  )

  const setCategories = useCallback(() => { /* actions escrevem diretamente no Dexie */ }, [])

  const totalBudgeted = useMemo(() => {
    return isLoaded ? calculateTotalBudgeted(categories) : 0
  }, [categories, isLoaded])

  const totalSpent = useMemo(() => {
    return isLoaded ? calculateTotalSpent(categories) : 0
  }, [categories, isLoaded])

  const investmentCategory = useMemo(() => categories.find(c => c.name === "Investimentos"), [categories])
  const availableForInvestment = useMemo(() =>
    investmentCategory ? investmentCategory.budgeted - investmentCategory.spent : 0,
    [investmentCategory]
  )

  const value = useMemo(() => ({
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory,
    totalBudgeted, totalSpent, availableForInvestment,
  }), [
    categories, addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory,
    totalBudgeted, totalSpent, availableForInvestment,
  ])

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error("useBudget deve ser utilizado dentro de um BudgetProvider")
  return ctx
}
