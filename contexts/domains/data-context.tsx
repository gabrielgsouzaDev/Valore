"use client"

import { createContext, useContext } from "react"
import { useLiveDb } from "@/hooks/useLiveDb"
import type {
  Asset, Category, Goal, Settings, ScheduledTransaction,
  CreditCard, CardExpense, Bank, PatrimonialSnapshot
} from "@/lib/types"
import { defaultSettings } from "@/lib/constants"

// ─── Tipo ───

type DataContextType = {
  assets: Asset[]
  categories: Category[]
  goals: Goal[]
  transactions: ScheduledTransaction[]
  creditCards: CreditCard[]
  cardExpenses: CardExpense[]
  banks: Bank[]
  patrimonialHistory: PatrimonialSnapshot[]
  settings: Settings
  isLoaded: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// ─── Provider ───

export function DataProvider({ children }: { children: React.ReactNode }) {
  const liveData = useLiveDb()

  // useLiveDb garante que todos os campos estão definidos quando isLoaded = true
  // Antes do load, usamos valores vazios para evitar undefined crashing em useMemo
  const value: DataContextType = {
    assets: liveData.assets || [],
    categories: liveData.categories || [],
    goals: liveData.goals || [],
    transactions: liveData.transactions || [],
    creditCards: liveData.creditCards || [],
    cardExpenses: liveData.cardExpenses || [],
    banks: liveData.banks || [],
    patrimonialHistory: (liveData.patrimonialHistory || []) as PatrimonialSnapshot[],
    settings: liveData.settings || defaultSettings,
    isLoaded: liveData.isLoaded,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// ─── Hook ───

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData deve ser utilizado dentro de um DataProvider")
  return ctx
}
