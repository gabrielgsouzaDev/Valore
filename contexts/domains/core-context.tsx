"use client"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { Settings, ThemePreset, BackupImportData } from "@/lib/types"
import { themePresets, defaultSettings, STORAGE_KEY, exampleData, CACHE_VERSION } from "@/lib/constants"
import { STORAGE_CONFIG } from "@/lib/business-constants"
import { summaryCacheSchema } from "@/lib/schemas"
import { useData } from "./data-context"
import { db } from "@/lib/db"
import type { ReactNode } from "react"

// ─── Tipos ───

type CoreContextType = {
  settings: Settings
  updateSettings: (data: Partial<Settings>) => void
  currentTheme: ThemePreset
  setTheme: (themeId: string) => void
  isLoaded: boolean
  isPrivate: boolean
  togglePrivacy: () => void
  exportData: () => void
  importData: (parsedData: BackupImportData) => Promise<void>
  clearAllData: () => void
  loadExampleData: () => void
  totalNetWorth: number
  totalBudgeted: number
  totalSpent: number
}

const CoreContext = createContext<CoreContextType | undefined>(undefined)

// ─── Fast-path cache ───
const CACHE_KEY = "valore_fast_path_cache"
type SummaryCache = {
  version: string
  totalNetWorth: number
  totalBudgeted: number
  totalSpent: number
  userName: string
  themeId: string
  lastUpdated: string
}

function getInitialCache(): SummaryCache | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(CACHE_KEY)
  return stored ? JSON.parse(stored) : null
}

// ─── Theme variables ───
export function applyThemeVariables(theme: ThemePreset) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
    root.style.setProperty(cssVarName, value as string)
  })
  if (theme.mode === "light") {
    root.classList.remove("dark")
    root.style.setProperty("--calendar-invert", "0")
  } else {
    root.classList.add("dark")
    root.style.setProperty("--calendar-invert", "1")
  }
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const bgColor = `rgb(${theme.colors.background.split(" ").join(", ")})`
    metaThemeColor.setAttribute("content", bgColor)
  }
}

// ─── Provider ───

export function CoreProvider({ children, totalNetWorth, totalBudgeted, totalSpent }: {
  children: ReactNode
  totalNetWorth: number
  totalBudgeted: number
  totalSpent: number
}) {
  const { assets, categories, goals, transactions, creditCards, cardExpenses, banks, patrimonialHistory, settings, isLoaded } = useData()

  const initialCache = useMemo(() => getInitialCache(), [])
  const [cachedTotals, setCachedTotals] = useState({
    netWorth: initialCache?.totalNetWorth || 0,
    budgeted: initialCache?.totalBudgeted || 0,
    spent: initialCache?.totalSpent || 0
  })

  // --- Temas ---
  const initialTheme = useMemo(() => themePresets.find((t: ThemePreset) => t.id === "paper") || themePresets[0], [])
  const currentTheme = themePresets.find((t: ThemePreset) => t.id === settings.themeId) || initialTheme

  const updateSettings = useCallback(async (data: Partial<Settings>) => {
    const current = await db.settings.get(1) || { id: 1, ...defaultSettings }
    const updated = { ...current, ...data }
    await db.settings.put(updated)
    // Aplica as variáveis do tema diretamente (evita recursão com setTheme).
    if (data.themeId) {
      const theme = themePresets.find((t: ThemePreset) => t.id === data.themeId) || initialTheme
      applyThemeVariables(theme)
    }
  }, [initialTheme])

  const setTheme = useCallback((themeId: string) => {
    // 1) Aplica instantaneamente (sem esperar o round-trip do IndexedDB).
    const theme = themePresets.find((t: ThemePreset) => t.id === themeId) || initialTheme
    applyThemeVariables(theme)
    // 2) Persiste em settings.themeId — assim o liveQuery atualiza `currentTheme`
    //    (move o indicador de seleção) e o fast-path cache preserva no reload.
    updateSettings({ themeId })
  }, [initialTheme, updateSettings])

  // --- Fast-path cache ---
  useEffect(() => {
    if (!isLoaded) return
    const summary = {
      version: CACHE_VERSION,
      totalNetWorth, totalBudgeted, totalSpent,
      userName: settings.nome, themeId: settings.themeId,
      lastUpdated: new Date().toISOString()
    }

    // Validação Zod antes de salvar conforme regra do projeto
    const validation = summaryCacheSchema.safeParse(summary)
    if (validation.success) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(validation.data))
    }

    setCachedTotals({ netWorth: totalNetWorth, budgeted: totalBudgeted, spent: totalSpent })
  }, [totalNetWorth, totalBudgeted, totalSpent, settings.nome, settings.themeId, isLoaded])

  // --- Privacy ---
  const togglePrivacy = useCallback(async () => {
    const current = await db.settings.get(1) || { id: 1, ...defaultSettings }
    await db.settings.update(1, { isPrivate: !current.isPrivate })
  }, [])
  const isPrivate = !!settings.isPrivate

  // --- Export ---
  const exportData = useCallback(() => {
    const safeSettings = { ...settings, isDemoMode: false }
    const dataToExport = {
      _app: "valore", _version: STORAGE_CONFIG.VERSION || 3,
      _exportedAt: new Date().toISOString(),
      assets, categories, goals, settings: safeSettings, transactions,
      creditCards, cardExpenses, banks, patrimonialHistory,
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `valore-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [assets, categories, goals, settings, transactions, creditCards, cardExpenses, banks, patrimonialHistory])

  // --- Import ---
  const importData = useCallback(async (parsed: BackupImportData) => {
    await db.transaction("rw", [
      db.assets, db.categories, db.goals, db.settings,
      db.transactions, db.creditCards, db.cardExpenses,
      db.banks, db.patrimonialHistory, db.assetCache, db.assetHistory
    ], async () => {
      await Promise.all([
        db.assets.clear(), db.categories.clear(), db.goals.clear(),
        db.settings.clear(), db.transactions.clear(), db.creditCards.clear(),
        db.cardExpenses.clear(), db.banks.clear(), db.patrimonialHistory.clear(),
        db.assetCache.clear(), db.assetHistory.clear()
      ])

      if (parsed.assets) await db.assets.bulkAdd(parsed.assets)
      if (parsed.categories) await db.categories.bulkAdd(parsed.categories)
      if (parsed.goals) await db.goals.bulkAdd(parsed.goals)

      const importedSettings = parsed.settings || defaultSettings
      await db.settings.put({ ...defaultSettings, ...importedSettings, id: 1 })

      if (parsed.transactions) await db.transactions.bulkAdd(parsed.transactions)
      if (parsed.creditCards) await db.creditCards.bulkAdd(parsed.creditCards)
      if (parsed.cardExpenses) await db.cardExpenses.bulkAdd(parsed.cardExpenses)
      if (parsed.banks) await db.banks.bulkAdd(parsed.banks)
      if (parsed.patrimonialHistory) await db.patrimonialHistory.bulkAdd(parsed.patrimonialHistory)

      // Sanitização de integridade referencial
      const [importedCards, importedBanks, importedCats] = await Promise.all([
        db.creditCards.toArray(), db.banks.toArray(), db.categories.toArray(),
      ])
      const cardIds = new Set(importedCards.map((c) => c.id))
      const bankIds = new Set(importedBanks.map((b) => b.id))
      const catIds = new Set(importedCats.map((c) => c.id))

      await db.cardExpenses.filter((e) => !cardIds.has(e.cardId)).delete()
      await db.assets.filter((a) => a.bankId !== undefined && !bankIds.has(a.bankId!)).modify({ bankId: undefined })
      await db.goals.filter((g) => g.bankId !== undefined && !bankIds.has(g.bankId!)).modify({ bankId: undefined })
      await db.transactions.filter((t) => t.categoryId !== undefined && !catIds.has(t.categoryId!)).modify({ categoryId: undefined })
    })
  }, [])

  // --- Clear ---
  const clearAllData = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem("valore_storage_version", "3")

      await db.transaction("rw", [
        db.assets, db.categories, db.goals, db.settings,
        db.transactions, db.creditCards, db.cardExpenses,
        db.banks, db.patrimonialHistory, db.assetCache, db.assetHistory
      ], async () => {
        await Promise.all([
          db.assets.clear(), db.categories.clear(), db.goals.clear(),
          db.settings.clear(), db.transactions.clear(), db.creditCards.clear(),
          db.cardExpenses.clear(), db.banks.clear(), db.patrimonialHistory.clear(),
          db.assetCache.clear(), db.assetHistory.clear()
        ])
        await db.settings.put({ ...defaultSettings, id: 1 })
      })
    }
  }, [])

  const loadExampleData = useCallback(() => {
    const currentName = settings.nome
    const dataWithUserContext = {
      ...exampleData,
      settings: {
        ...exampleData.settings,
        nome: currentName || exampleData.settings.nome,
        onboardingCompleted: settings.onboardingCompleted,
        isDemoMode: true
      }
    }
    importData(dataWithUserContext)
  }, [importData, settings.nome, settings.onboardingCompleted])

  const value = useMemo(() => ({
    settings, updateSettings, currentTheme, setTheme,
    isLoaded, isPrivate, togglePrivacy,
    exportData, importData, clearAllData, loadExampleData,
    totalNetWorth, totalBudgeted, totalSpent,
  }), [
    settings, updateSettings, currentTheme, setTheme,
    isLoaded, isPrivate, togglePrivacy,
    exportData, importData, clearAllData, loadExampleData,
    totalNetWorth, totalBudgeted, totalSpent,
  ])

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>
}

export function useCore() {
  const ctx = useContext(CoreContext)
  if (!ctx) throw new Error("useCore deve ser utilizado dentro de um CoreProvider")
  return ctx
}
