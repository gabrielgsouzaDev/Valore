"use client"

import { useInvestments } from "./hooks/useInvestments"
import { AssetCard } from "@/components/asset-card"
import { ContributionWidget } from "@/components/contribution-widget"
import { UpdateTable } from "@/components/update-table"
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
import { AssetDialog } from "@/components/asset-dialog"
import { FireSimulator } from "@/components/fire-simulator"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { TrendingUp } from "lucide-react"

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
    } = useInvestments()

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
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                    <div className="xl:col-span-2 space-y-6 sm:space-y-8">
                        {assets.length === 0 ? (
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
                                        onEdit={() => { setEditingAsset(asset); setDialogOpen(true); }}
                                        onDelete={() => { setAssetToDelete(asset.id); setConfirmOpen(true); }}
                                        isPrivate={!!settings.isPrivate}
                                    />
                                ))}
                            </div>
                        )}

                        <ErrorBoundary moduleName="Tabela de Ativos">
                            <UpdateTable assets={assets} onUpdate={handleUpdateAssetFromTable} />
                        </ErrorBoundary>
                    </div>

                    <div className="space-y-6 sm:space-y-8 min-w-0">
                        <ErrorBoundary moduleName="Calculadora de Aportes">
                            <ContributionWidget assets={assets} totalNetWorth={totalNetWorth} initialAmount={initialAporte} />
                        </ErrorBoundary>

                        <ErrorBoundary moduleName="Simulador FIRE">
                            <FireSimulator
                                currentEquity={totalNetWorth}
                                monthlyContribution={
                                    (assets.reduce((acc, a) => acc + (a.annualDividend || 0), 0) / 12) +
                                    Math.max(0, settings.rendaMensal - (totalBudgeted || 0))
                                }
                            />
                        </ErrorBoundary>

                        <AssetDistributionChart
                            assets={assets}
                            distributionData={distributionData}
                            totalNetWorth={totalNetWorth}
                            isPrivate={!!settings.isPrivate}
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
        </>
    )
}

import { Suspense } from "react"

export default function InvestimentosPage() {
    return (
        <Suspense fallback={<div className="p-8">Carregando investimentos...</div>}>
            <InvestimentosContent />
        </Suspense>
    )
}
