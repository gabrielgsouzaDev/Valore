"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { useLiveDb } from "@/hooks/useLiveDb"
import { useToast } from "@/hooks/use-toast"
import type { Asset, Category } from "@/lib/types"

/**
 * Hook customizado para o módulo de Investimentos.
 * Consolida lógica de cálculo de patrimônio, rentabilidade e gerenciamento de ativos.
 */
export function useInvestments() {
    const {
        addAsset,
        updateAsset,
        deleteAsset,
        getTotalCardDebt,
    } = useApp()

    // ── Dados Reativos do IndexedDB ──────────────────────────────────────────
    const { assets: liveAssets, categories: liveCategories, settings, isLoaded } = useLiveDb()
    const { toast } = useToast()
    const searchParams = useSearchParams()

    // ── Estado de Dados ──────────────────────────────────────────────────────
    const assets = liveAssets || []
    const categories = liveCategories || []
    const isLoading = !isLoaded

    const totalBudgeted = useMemo(() => (
        categories.reduce((acc: number, cat: Category) => acc + (cat.budgeted || 0), 0)
    ), [categories])

    const totalNetWorth = useMemo(() => (
        assets.reduce((acc: number, a: Asset) => acc + (a.currentValue || 0), 0)
    ), [assets])

    // ── Estado de Aporte ──────────────────────────────────────────────────────
    const aporteParam = searchParams.get("aporte")
    const initialAporte = aporteParam ? Number.parseFloat(aporteParam) : undefined

    // ── Estado de UI ──────────────────────────────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [assetToDelete, setAssetToDelete] = useState<number | null>(null)
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)

    // ── Cálculos de Carteira Memoizados ──────────────────────────────────────

    const totalInvested = useMemo(() => (
        assets.reduce((acc: number, a: Asset) => acc + (Number(a.quantity || 0) * Number(a.averagePrice || 0)), 0)
    ), [assets])

    const totalGain = useMemo(() => totalNetWorth - totalInvested, [totalNetWorth, totalInvested])

    const profitability = useMemo(() => (
        totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
    ), [totalInvested, totalGain])

    const distributionData = useMemo(() => (
        assets.length > 0 ?
            Object.entries(assets.reduce((acc: Record<string, number>, a: Asset) => {
                acc[a.type] = (acc[a.type] || 0) + (a.currentValue || 0)
                return acc
            }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
            : []
    ), [assets])

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSaveAsset = (assetData: Omit<Asset, "id" | "currentValue" | "lastUpdated">) => {
        if (editingAsset) {
            updateAsset(editingAsset.id, assetData)
            setEditingAsset(null)
            toast({ title: "Ativo atualizado" })
        } else {
            addAsset(assetData)
            toast({ title: "Ativo adicionado com sucesso" })
        }
        setDialogOpen(false)
    }

    const handleDeleteAsset = () => {
        if (assetToDelete !== null) {
            deleteAsset(assetToDelete)
            setAssetToDelete(null)
            setConfirmOpen(false)
            toast({ title: "Ativo removido" })
        }
    }

    return {
        // Estado
        assets,
        totalNetWorth,
        totalInvested,
        totalGain,
        profitability,
        distributionData,
        getTotalCardDebt,
        totalBudgeted,
        settings: settings || { isPrivate: false, activeModules: {}, rendaMensal: 0 },
        initialAporte,
        isLoading,

        // Diálogos
        dialogOpen, setDialogOpen,
        editingAsset, setEditingAsset,
        confirmOpen, setConfirmOpen,
        assetToDelete, setAssetToDelete,
        selectedAssetId, setSelectedAssetId,

        // Handlers
        handleSaveAsset,
        handleDeleteAsset,
    }
}
