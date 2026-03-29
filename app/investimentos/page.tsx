"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, ArrowUpRight, CreditCard, TrendingUp, Plus } from "lucide-react"
import { AssetCard } from "@/components/asset-card"
import { ContributionWidget } from "@/components/contribution-widget"
import { UpdateTable } from "@/components/update-table"
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
import { AssetDialog } from "@/components/asset-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { INTERFACE_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"
import Link from "next/link"
import type { Asset } from "@/lib/types"

function InvestimentosContent() {
    const { assets, addAsset, updateAsset, deleteAsset, totalNetWorth, settings, getTotalCardDebt } = useApp()
    const { toast } = useToast()
    const searchParams = useSearchParams()
    const aporteParam = searchParams.get("aporte")
    const initialAporte = aporteParam ? Number.parseFloat(aporteParam) : undefined

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [assetToDelete, setAssetToDelete] = useState<number | null>(null)

    const handleAddAsset = (assetData: Omit<Asset, "id" | "currentValue" | "lastUpdated">) => {
        addAsset(assetData)
        setDialogOpen(false)
        toast({ title: "Ativo adicionado com sucesso" })
    }

    const handleEditAsset = (assetData: Omit<Asset, "id" | "currentValue" | "lastUpdated">) => {
        if (!editingAsset) return
        updateAsset(editingAsset.id, assetData)
        setEditingAsset(null)
        setDialogOpen(false)
        toast({ title: "Ativo atualizado" })
    }

    const handleUpdateAsset = (id: number, data: Partial<Asset>) => {
        updateAsset(id, data)
        toast({ title: "Ativo atualizado" })
    }

    const openEditDialog = (asset: Asset) => {
        setEditingAsset(asset)
        setDialogOpen(true)
    }

    const handleDeleteClick = (id: number) => {
        setAssetToDelete(id)
        setConfirmOpen(true)
    }

    const totalInvested = assets.reduce((acc, a) => acc + (a.quantity * a.averagePrice), 0)
    const totalGain = totalNetWorth - totalInvested
    const profitability = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    return (
        <>
            <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        <div>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Investimentos</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">Gestão de ativos • Rebalanceamento</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/configuracoes">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Button
                            onClick={() => { setEditingAsset(null); setDialogOpen(true); }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-md shadow-primary/20"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Novo Ativo
                        </Button>
                    </div>
                </div>
            </header>

            <DemoBanner />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto transition-theme">
                {/* Highlights Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                    <Card className="bg-card border-border p-4 sm:p-6 shadow-sm group hover:border-primary/30 transition-all">
                        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Patrimônio Atual</p>
                        <div className="text-2xl sm:text-4xl font-black text-primary tracking-tighter">
                            <NumberTicker value={totalNetWorth} currency isPrivate={settings.isPrivate} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant="outline" className={cn(
                                "text-[10px] py-0 px-1.5 font-bold border-none",
                                totalGain >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                            )}>
                                {profitability >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                                {profitability.toFixed(1)}% ({totalGain >= 0 ? "+" : ""}{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalGain)})
                            </Badge>
                        </div>
                    </Card>

                    <Card className="bg-card border-border p-4 sm:p-6 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Investido</p>
                        <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter">
                            <NumberTicker value={totalInvested} currency isPrivate={settings.isPrivate} />
                        </div>
                    </Card>

                    <Card className="bg-card border-border p-4 sm:p-6 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Dívidas (Cartões)</p>
                        <div className="text-2xl sm:text-4xl font-black text-danger tracking-tighter">
                            <NumberTicker value={getTotalCardDebt()} currency isPrivate={settings.isPrivate} />
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                    <div className="xl:col-span-2 space-y-6 sm:space-y-8">
                        {assets.length === 0 ? (
                            <EmptyState
                                icon={TrendingUp}
                                title="Sua carteira está vazia"
                                description="Adicione seu primeiro ativo para começar a acompanhar o crescimento do seu patrimônio e receber recomendações de aporte."
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
                                        onEdit={() => openEditDialog(asset)}
                                        onDelete={() => handleDeleteClick(asset.id)}
                                        isPrivate={settings.isPrivate}
                                    />
                                ))}
                            </div>
                        )}

                        <ErrorBoundary moduleName="Tabela de Ativos">
                            <UpdateTable assets={assets} onUpdate={handleUpdateAsset} />
                        </ErrorBoundary>
                    </div>

                    <div className="space-y-6 sm:space-y-8 min-w-0">
                        <div className="grid grid-cols-1 gap-6 sm:gap-8">
                            <ErrorBoundary moduleName="Calculadora de Aportes">
                                <ContributionWidget assets={assets} totalNetWorth={totalNetWorth} initialAmount={initialAporte} />
                            </ErrorBoundary>

                            <Card className="bg-card border-border p-6 border-dashed opacity-60">
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="p-3 bg-muted rounded-full mb-4">
                                        <TrendingUp className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground mb-1 uppercase tracking-tighter italic">Gráficos em Manutenção</h4>
                                    <p className="text-xs text-muted-foreground">Estamos refinando a visualização de histórico e alocação para maior precisão.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

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
                description="Esta ação não pode ser desfeita. Deseja remover permanentemente este ativo da sua carteira?"
                variant="destructive"
                onConfirm={() => {
                    if (assetToDelete !== null) {
                        deleteAsset(assetToDelete)
                        setAssetToDelete(null)
                        toast({ title: "Ativo removido" })
                    }
                }}
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
