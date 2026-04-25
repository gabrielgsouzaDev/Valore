"use client"
import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from "react"
import { Asset, PatrimonialSnapshot } from "@/lib/types"
import { calculateTotalNetWorth } from "@/lib/services"
import { useAssetActions } from "@/contexts/hooks/use-actions"
import { useData } from "./data-context"
import { db } from "@/lib/db"

type InvestmentContextType = {
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Omit<Asset, "id" | "currentValue">) => Promise<void>
  updateAsset: (id: number, data: Partial<Asset>) => Promise<void>
  deleteAsset: (id: number) => Promise<void>
  patrimonialHistory: PatrimonialSnapshot[]
  savePatrimonialSnapshot: () => void
  syncAssetsPrices: () => Promise<void>
  totalNetWorth: number
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined)

/** Lógica de sync reutilizada (auto-trigger + manual call) */
async function doSyncAssetsPrices(currentAssets: Asset[]) {
  const syncable = currentAssets.filter(a => a.syncAvailable && a.ticker)
  if (syncable.length === 0) return

  const now = new Date()
  const needsSync = syncable.some(a => {
    if (!a.lastSync) return true
    return (now.getTime() - new Date(a.lastSync).getTime()) / (1000 * 60 * 60) > 1
  })
  if (!needsSync) return

  try {
    const tickers = syncable.map(a => a.ticker).join(',')
    const res = await fetch(`/api/assets/sync?tickers=${tickers}`)
    if (!res.ok) throw new Error('Falha HTTP ao sincronizar')
    const { prices } = await res.json()
    if (!prices) return

    const updatedAssets = currentAssets.map((asset) => {
      if (asset.syncAvailable && asset.ticker && prices[asset.ticker]) {
        return {
          ...asset,
          price: prices[asset.ticker],
          currentValue: prices[asset.ticker] * asset.quantity,
          lastSync: now.toISOString(),
          lastUpdated: now.toISOString()
        }
      }
      return asset
    })

    await db.transaction("rw", db.table("assets"), async () => {
      for (const a of updatedAssets) await db.table("assets").put(a)
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return
    console.error("Valore Sync Error:", error)
  }
}

export function InvestmentProvider({ children }: { children: React.ReactNode }) {
  const { assets, banks, patrimonialHistory, isLoaded } = useData()
  const [assetsState, setAssetsState] = useState<Asset[]>([])

  const { addAsset, updateAsset, deleteAsset } = useAssetActions(assets, setAssetsState)
  const setAssets = useCallback(() => { /* Dexie write-through */ }, [])

  // --- Computed ---
  const totalNetWorth = useMemo(() => {
    return isLoaded ? calculateTotalNetWorth(assets, banks) : 0
  }, [assets, banks, isLoaded])

  // --- Sync on load ---
  const assetsRef = useRef(assets)
  useEffect(() => { assetsRef.current = assets })

  useEffect(() => {
    if (!isLoaded) return
    const controller = new AbortController()
    doSyncAssetsPrices(assetsRef.current)
    return () => controller.abort()
  }, [isLoaded])

  // --- Public sync function (manual call) ---
  const syncAssetsPrices = useCallback(async () => doSyncAssetsPrices(assets), [assets])

  // --- Snapshot Patrimonial ---
  const savePatrimonialSnapshot = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]
    const snapshot = { date: today, totalNetWorth }
    await db.table("patrimonialHistory").put(snapshot)
  }, [totalNetWorth])

  useEffect(() => {
    if (!isLoaded || totalNetWorth === 0) return
    const today = new Date().toISOString().split("T")[0]
    const hasTodaySnapshot = patrimonialHistory.some(s => s.date === today)
    if (!hasTodaySnapshot) {
      savePatrimonialSnapshot()
    } else if (patrimonialHistory.length > 0) {
      const todaySnapshot = patrimonialHistory.find(s => s.date === today)
      if (todaySnapshot && Math.abs(todaySnapshot.totalNetWorth - totalNetWorth) > 0.01) {
        savePatrimonialSnapshot()
      }
    }
  }, [totalNetWorth, isLoaded, patrimonialHistory, savePatrimonialSnapshot])

  const value = useMemo(() => ({
    assets, setAssets, addAsset, updateAsset, deleteAsset,
    patrimonialHistory, savePatrimonialSnapshot,
    syncAssetsPrices, totalNetWorth,
  }), [
    assets, addAsset, updateAsset, deleteAsset,
    patrimonialHistory, savePatrimonialSnapshot,
    syncAssetsPrices, totalNetWorth,
  ])

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>
}

export function useInvestment() {
  const ctx = useContext(InvestmentContext)
  if (!ctx) throw new Error("useInvestment deve ser utilizado dentro de um InvestmentProvider")
  return ctx
}
