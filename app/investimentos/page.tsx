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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { DemoBanner } from "@/components/demo-banner"
import { AssetDialog } from "@/components/asset-dialog"
import { FireSimulator } from "@/components/fire-simulator"
import { TaxReport } from "@/components/tax-report"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { INTERFACE_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"
import Link from "next/link"
import type { Asset } from "@/lib/types"

function InvestimentosContent() {
    const { assets, addAsset, updateAsset, deleteAsset, totalNetWorth, settings, getTotalCardDebt, totalBudgeted } = useApp()
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

    const handleUpdateAssetFromTable = (id: number, quantity: number, price: number, ceilingPrice?: number, priority?: number, averagePrice?: number, annualDividend?: number) => {
        updateAsset(id, { quantity, price, ceilingPrice, priority, averagePrice, annualDividend })
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

    const totalInvested = assets.reduce((acc, a) => acc + (Number(a.quantity || 0) * Number(a.averagePrice || 0)), 0)
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
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                            <UpdateTable assets={assets} onUpdate={handleUpdateAssetFromTable} />
                        </ErrorBoundary>
                    </div>

                    <div className="space-y-6 sm:space-y-8 min-w-0">
                        <div className="grid grid-cols-1 gap-6 sm:gap-8">
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

                            <Card className="bg-card border-border p-6 shadow-sm overflow-hidden relative">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Distribuição</h3>
                                <div className="h-[240px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={assets.length > 0 ?
                                                    Object.entries(assets.reduce((acc, a) => {
                                                        acc[a.type] = (acc[a.type] || 0) + a.currentValue
                                                        return acc
                                                    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
                                                    : [{ name: "Nenhum", value: 1 }]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {assets.length > 0 ?
                                                    Object.keys(assets.reduce((acc, a) => {
                                                        acc[a.type] = true
                                                        return acc
                                                    }, {} as Record<string, boolean>)).map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="var(--primary)"
                                                            fillOpacity={(100 - (index * 15)) / 100}
                                                            stroke="var(--card)"
                                                            strokeWidth={2}
                                                        />
                                                    ))
                                                    : <Cell fill="var(--muted)" />}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "var(--card)",
                                                    borderColor: "var(--border)",
                                                    borderRadius: "12px",
                                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                    borderWidth: "1px"
                                                }}
                                                itemStyle={{ color: "var(--foreground)", fontSize: "12px", fontWeight: "800" }}
                                                formatter={(value: number) => settings.isPrivate ? "***" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 justify-center">
                                    {Object.entries(assets.reduce((acc, a) => {
                                        acc[a.type] = (acc[a.type] || 0) + a.currentValue
                                        return acc
                                    }, {} as Record<string, number>)).map(([type, value], i) => (
                                        <div key={type} className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded-md border border-border/50">
                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--primary)", opacity: (100 - (i * 15)) / 100 }} />
                                            <span className="text-[9px] font-black text-foreground uppercase tracking-tighter">{type}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground">
                                                {totalNetWorth > 0 ? ((value / totalNetWorth) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* IR Report Trigger */}
                                <div className="mt-8 flex justify-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                                <Settings className="h-3 w-3 mr-2" /> Relatório de Bens e Direitos
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0 sm:p-0">
                                            <DialogHeader className="p-6 pb-2">
                                                <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Declaração de Bens</DialogTitle>
                                                <DialogDescription>Consolidado de ativos para fins de Imposto de Renda</DialogDescription>
                                            </DialogHeader>
                                            <div className="p-6 pt-0">
                                                <TaxReport assets={assets} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
