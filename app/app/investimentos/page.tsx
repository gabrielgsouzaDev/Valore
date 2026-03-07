"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, ArrowUpRight, CreditCard, TrendingUp, Plus } from "lucide-react"
import { AssetCard } from "@/components/asset-card"
import { ContributionWidget } from "@/components/contribution-widget"
import { UpdateTable } from "@/components/update-table"
import { Sidebar } from "@/components/sidebar"
import { AssetDialog } from "@/components/asset-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import dynamic from "next/dynamic"
import type { Asset } from "@/lib/types"

// Dynamic imports for charts (no SSR)
const PortfolioChart = dynamic(() => import("@/components/portfolio-chart").then(mod => mod.PortfolioChart), { ssr: false })
const HistoryChart = dynamic(() => import("@/components/history-chart").then(mod => mod.HistoryChart), { ssr: false })

export default function InvestimentosPage() {
    const { assets, addAsset, updateAsset, deleteAsset, totalNetWorth, settings, getTotalCardDebt } = useApp()
    const { toast } = useToast()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [assetToDelete, setAssetToDelete] = useState<number | null>(null)

    const totalCardDebt = getTotalCardDebt()

    const handleAddAsset = (assetData: Omit<Asset, "id" | "currentValue">) => {
        addAsset(assetData)
        setDialogOpen(false)
        toast({ title: "Ativo adicionado" })
    }

    const handleEditAsset = (assetData: Omit<Asset, "id" | "currentValue">) => {
        if (!editingAsset) return
        updateAsset(editingAsset.id, assetData)
        setEditingAsset(null)
        setDialogOpen(false)
        toast({ title: "Ativo atualizado" })
    }

    const handleDeleteAsset = (id: number) => {
        setAssetToDelete(id)
        setConfirmOpen(true)
    }

    const handleUpdateAsset = (id: number, quantity: number, price: number, ceilingPrice?: number, priority?: number) => {
        updateAsset(id, { quantity, price, ceilingPrice, priority })
    }

    const openEditDialog = (asset: Asset) => {
        setEditingAsset(asset)
        setDialogOpen(true)
    }

    const openAddDialog = () => {
        setEditingAsset(null)
        setDialogOpen(true)
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Sidebar />

            <main className="lg:ml-64 transition-all duration-300 pb-20 lg:pb-0">
                <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
                    <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                            <div className="flex flex-col justify-center">
                                <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Investimentos</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">Investimentos • Portfólio em tempo real</p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right flex flex-col justify-center">
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Patrimônio Total</p>
                            <p className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
                                {formatCurrency(totalNetWorth)}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 overflow-hidden">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                        <div className="xl:col-span-2 space-y-6 sm:space-y-8 min-w-0">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="text-base sm:text-xl font-semibold text-foreground">Alocação de Ativos</h2>
                                    <Button onClick={openAddDialog} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm transition-theme font-medium">
                                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                                        Novo Ativo
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {assets.map((asset) => (
                                        <AssetCard key={asset.id} asset={asset} totalNetWorth={totalNetWorth} onEdit={() => openEditDialog(asset)} onDelete={() => handleDeleteAsset(asset.id)} />
                                    ))}
                                </div>
                            </div>

                            <ErrorBoundary moduleName="Tabela de Ativos">
                                <UpdateTable assets={assets} onUpdate={handleUpdateAsset} />
                            </ErrorBoundary>
                            <ErrorBoundary moduleName="Evolução Patrimonial">
                                <HistoryChart />
                            </ErrorBoundary>
                        </div>

                        <div className="space-y-6 sm:space-y-8 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6 sm:gap-8">
                                <ErrorBoundary moduleName="Composição da Carteira">
                                    <PortfolioChart assets={assets} totalNetWorth={totalNetWorth} />
                                </ErrorBoundary>
                                <ErrorBoundary moduleName="Calculadora de Aportes">
                                    <ContributionWidget assets={assets} totalNetWorth={totalNetWorth} />
                                </ErrorBoundary>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <AssetDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                asset={editingAsset}
                onSave={editingAsset ? handleEditAsset : handleAddAsset}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Excluir ativo"
                description="Esta ação não pode ser desfeita."
                variant="destructive"
                onConfirm={() => {
                    if (assetToDelete !== null) {
                        deleteAsset(assetToDelete)
                        setAssetToDelete(null)
                    }
                }}
            />
        </div >
    )
}
