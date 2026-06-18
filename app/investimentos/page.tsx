"use client"

import { Suspense, useCallback } from "react"
import type { Asset } from "@/lib/types"
import { useInvestments } from "./hooks/useInvestments"
import { AssetCard } from "@/components/asset-card"
import { ContributionWidget } from "@/components/contribution-widget"
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
import { AssetDialog } from "@/components/asset-dialog"
import { AssetDetailsModal } from "./components/AssetDetailsModal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { TrendingUp } from "lucide-react"
import { SkeletonCard } from "@/components/ui/skeleton-card"

// Subcomponêntes Locais
import { InvestmentsHeader } from "./components/InvestmentsHeader"
import { InvestmentsSummary } from "./components/InvestmentsSummary"
import { AssetDistributionChart } from "./components/AssetDistributionChart"

/**
 * Componente principal de conteúdo de Investimentos.
 */
function InvestimentosContent() {
    const {
        assets,
        totalNetWorth,
        totalInvested,
        totalGain,
        profitability,
        distributionData,
        getTotalCardDebt,
        settings,
        initialAporte,

        // Diálogos
        dialogOpen, setDialogOpen,
        editingAsset, setEditingAsset,
        confirmOpen, setConfirmOpen,
        assetToDelete, setAssetToDelete,

        // Detalhes
        selectedAssetId, setSelectedAssetId,

        // Handlers
        handleSaveAsset,
        handleDeleteAsset,
        isLoading
    } = useInvestments()

    // Callbacks estáveis: evitam recriar funções por render, o que anularia o
    // memo() da AssetCard e re-renderizaria todos os cards a cada mudança do pai.
    const handleEditAsset = useCallback((a: Asset) => { setEditingAsset(a); setDialogOpen(true) }, [setEditingAsset, setDialogOpen])
    const handleRequestDelete = useCallback((id: number) => { setAssetToDelete(id); setConfirmOpen(true) }, [setAssetToDelete, setConfirmOpen])
    const handleShowDetails = useCallback((id: number) => setSelectedAssetId(id), [setSelectedAssetId])

    return (
        <>
            <InvestmentsHeader onAddAsset={() => { setEditingAsset(null); setDialogOpen(true); }} />
            <DemoBanner />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto transition-theme">
                <InvestmentsSummary
                    totalNetWorth={totalNetWorth}
                    totalInvested={totalInvested}
                    totalGain={totalGain}
                    profitability={profitability}
                    cardDebt={getTotalCardDebt()}
                    isPrivate={!!settings.isPrivate}
                    isLoading={isLoading}
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                    <div className="xl:col-span-2 space-y-6 sm:space-y-8">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <SkeletonCard key={i} variant="list-item" className="h-[120px]" />
                                ))}
                            </div>
                        ) : assets.length === 0 ? (
                            <EmptyState
                                icon={TrendingUp}
                                title="Sua carteira está vazia"
                                description="Adicione seu primeiro ativo para começar a acompanhar o crescimento do seu patrimônio."
                                actionLabel="Adicionar Ativo"
                                onAction={() => setDialogOpen(true)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {assets.map((asset) => (
                                    <AssetCard
                                        key={asset.id}
                                        asset={asset}
                                        totalNetWorth={totalNetWorth}
                                        onEdit={handleEditAsset}
                                        onDelete={handleRequestDelete}
                                        onShowDetails={handleShowDetails}
                                        isPrivate={!!settings.isPrivate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 sm:space-y-8 min-w-0">
                        <ErrorBoundary moduleName="Calculadora de Aportes">
                            {isLoading ? (
                                <SkeletonCard variant="summary" className="h-[300px]" />
                            ) : (
                                <ContributionWidget
                                    assets={assets}
                                    totalNetWorth={totalNetWorth}
                                    initialAmount={initialAporte}
                                />
                            )}
                        </ErrorBoundary>

                        <AssetDistributionChart
                            distributionData={distributionData}
                            totalNetWorth={totalNetWorth}
                            isPrivate={!!settings.isPrivate}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>

            <AssetDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                asset={editingAsset}
                onSave={handleSaveAsset}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Excluir ativo"
                description="Esta ação não pode ser desfeita. Deseja remover permanentemente este ativo?"
                variant="destructive"
                onConfirm={handleDeleteAsset}
            />

            <AssetDetailsModal
                assetId={selectedAssetId}
                onClose={() => setSelectedAssetId(null)}
                isPrivate={!!settings.isPrivate}
            />
        </>
    )
}

export default function InvestimentosPage() {
    return (
        <Suspense fallback={<div className="p-8">Carregando investimentos...</div>}>
            <InvestimentosContent />
        </Suspense>
    )
}
