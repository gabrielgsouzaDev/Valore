"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, ArrowUpRight, CreditCard } from "lucide-react"
import { AssetCard } from "@/components/asset-card"
import { ContributionWidget } from "@/components/contribution-widget"
import { UpdateTable } from "@/components/update-table"
import { PortfolioChart } from "@/components/portfolio-chart"
import { HistoryChart } from "@/components/history-chart"
import { BudgetComparison } from "@/components/budget-comparison"
import { Sidebar } from "@/components/sidebar"
import { AssetDialog } from "@/components/asset-dialog"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"

export default function Dashboard() {
  const { assets, addAsset, updateAsset, deleteAsset, totalNetWorth, settings, getTotalCardDebt } = useApp()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<(typeof assets)[0] | null>(null)

  const totalCardDebt = getTotalCardDebt()

  const handleAddAsset = (assetData: Omit<(typeof assets)[0], "id" | "currentValue">) => {
    addAsset(assetData)
    setDialogOpen(false)
  }

  const handleEditAsset = (assetData: Omit<(typeof assets)[0], "id" | "currentValue">) => {
    if (!editingAsset) return
    updateAsset(editingAsset.id, assetData)
    setEditingAsset(null)
    setDialogOpen(false)
  }

  const handleDeleteAsset = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este ativo?")) {
      deleteAsset(id)
    }
  }

  const handleUpdateAsset = (id: number, quantity: number, price: number) => {
    updateAsset(id, { quantity, price })
  }

  const openEditDialog = (asset: (typeof assets)[0]) => {
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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="lg:ml-64 transition-all duration-300 pt-20 lg:pt-0">
        <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            {/* Mobile: stack layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  {settings.nome} - Investimentos
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Acompanhe seu portfólio em tempo real</p>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-1 sm:pb-0">
                {totalCardDebt > 0 && (
                  <Link href="/cartoes" className="text-right hover:opacity-80 transition-opacity flex-shrink-0">
                    <div
                      className="flex items-center gap-1.5 sm:gap-2 font-medium"
                      style={{ color: "rgb(248 113 113)" }}
                    >
                      <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Dívida</span>
                    </div>
                    <p className="text-base sm:text-xl font-bold" style={{ color: "rgb(248 113 113)" }}>
                      {formatCurrency(totalCardDebt)}
                    </p>
                  </Link>
                )}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Patrimônio</p>
                  <p className="text-xl sm:text-3xl font-bold text-primary">{formatCurrency(totalNetWorth)}</p>
                </div>
                <Link
                  href="/configuracoes"
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary hidden sm:flex"
                  aria-label="Configurações"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Historical Net Worth Chart */}
              <HistoryChart />

              {/* Asset Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base sm:text-xl font-semibold text-foreground">Alocação de Ativos</h2>
                  <Button
                    onClick={openAddDialog}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm transition-theme font-medium"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  {assets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      totalNetWorth={totalNetWorth}
                      onEdit={() => openEditDialog(asset)}
                      onDelete={() => handleDeleteAsset(asset.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Update Table */}
              <UpdateTable assets={assets} onUpdate={handleUpdateAsset} />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                {/* Portfolio Chart */}
                <PortfolioChart assets={assets} totalNetWorth={totalNetWorth} />

                {/* Budget Comparison Chart */}
                <BudgetComparison />

                {/* Contribution Widget */}
                <ContributionWidget assets={assets} totalNetWorth={totalNetWorth} />
              </div>

              {/* Quick Stats */}
              <Card className="bg-card border-border p-4 sm:p-6 transition-theme">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Performance</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-foreground/80">Mês</span>
                    <div className="flex items-center gap-1 font-medium" style={{ color: "rgb(52 211 153)" }}>
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">+8.3%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-foreground/80">Ano</span>
                    <div className="flex items-center gap-1 font-medium" style={{ color: "rgb(52 211 153)" }}>
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">+24.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-foreground/80">Total</span>
                    <div className="flex items-center gap-1 font-medium" style={{ color: "rgb(52 211 153)" }}>
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">+42.1%</span>
                    </div>
                  </div>
                </div>
              </Card>
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
    </div>
  )
}
