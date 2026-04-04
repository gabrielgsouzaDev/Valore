"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { Asset } from "@/lib/types"

/**
 * Hook customizado para o módulo de Investimentos.
 * Consolida lógica de cálculo de patrimônio, rentabilidade e gerenciamento de ativos.
 */
export function useInvestments() {
    const {
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        totalNetWorth,
        settings,
        getTotalCardDebt,
        totalBudgeted
    } = useApp()
    const { toast } = useToast()
    const searchParams = useSearchParams()

    // ── Estado de Aporte ──────────────────────────────────────────────────────
    const aporteParam = searchParams.get("aporte")
    const initialAporte = aporteParam ? Number.parseFloat(aporteParam) : undefined

    // ── Estado de UI ──────────────────────────────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [assetToDelete, setAssetToDelete] = useState<number | null>(null)

    // ── Cálculos de Carteira ──────────────────────────────────────────────────
    const totalInvested = assets.reduce((acc, a) => acc + (Number(a.quantity || 0) * Number(a.averagePrice || 0)), 0)
    const totalGain = totalNetWorth - totalInvested
    const profitability = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    const distributionData = assets.length > 0 ?
        Object.entries(assets.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + a.currentValue
            return acc
        }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
        : []

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

    const handleUpdateAssetFromTable = (id: number, quantity: number, price: number, ceilingPrice?: number, priority?: number, averagePrice?: number, annualDividend?: number) => {
        updateAsset(id, { quantity, price, ceilingPrice, priority, averagePrice, annualDividend })
        toast({ title: "Ativo atualizado" })
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
        settings,
        initialAporte,

        // Diálogos
        dialogOpen, setDialogOpen,
        editingAsset, setEditingAsset,
        confirmOpen, setConfirmOpen,
        assetToDelete, setAssetToDelete,

        // Handlers
        handleSaveAsset,
        handleDeleteAsset,
        handleUpdateAssetFromTable,
    }
}
