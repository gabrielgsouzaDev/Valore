"use client"

import { memo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, AlertTriangle, Pencil, Trash2, Check, X, RefreshCcw } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { formatCurrency, getAssetBarColor } from "@/lib/services"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"
import type { Asset } from "@/lib/types"

interface AssetCardProps {
  asset: Asset
  totalNetWorth: number
  onEdit?: (asset: Asset) => void
  onDelete?: (id: number) => void
  isPrivate?: boolean
  onShowDetails?: (id: number) => void
}

export const AssetCard = memo(function AssetCard({ asset, totalNetWorth, onEdit, onDelete, onShowDetails, isPrivate = false }: AssetCardProps) {
  const { updateAsset } = useApp()
  const [isQuickEditing, setIsQuickEditing] = useState(false)
  const [quickForm, setQuickForm] = useState({
    price: asset.price.toString(),
    quantity: asset.quantity.toString()
  })

  const currentPercentage = (asset.currentValue / totalNetWorth) * 100
  const difference = currentPercentage - asset.targetPercentage
  const progressValue = (currentPercentage / asset.targetPercentage) * 100

  const totalCost = asset.quantity * asset.averagePrice
  const totalGain = asset.currentValue - totalCost
  const rentabilidade = asset.averagePrice > 0 ? ((asset.price / asset.averagePrice) - 1) * 100 : 0
  const yoc = (asset.annualDividend && asset.averagePrice > 0) ? (asset.annualDividend / asset.averagePrice) * 100 : 0

  const handleQuickSave = () => {
    updateAsset(asset.id, {
      price: Number(quickForm.price) || 0,
      quantity: Number(quickForm.quantity) || 0
    })
    setIsQuickEditing(false)
  }

  // Alert logic for stale prices and Bitcoin
  const isBitcoin = asset.name === "Bitcoin"
  const showSellAlert = isBitcoin && currentPercentage > 25
  const showBuyAlert = isBitcoin && currentPercentage < 15

  const isStale = asset.lastUpdated
    ? (new Date().getTime() - new Date(asset.lastUpdated).getTime()) > 7 * 24 * 60 * 60 * 1000
    : true

  const getBorderColor = () => {
    if (showSellAlert) return "border-danger"
    if (showBuyAlert) return "border-success"
    if (isStale) return "border-muted-foreground/50"
    if (Math.abs(difference) < 2) return "border-primary"
    return "border-border"
  }

  return (
    <Card
      className={`bg-card ${getBorderColor()} border-2 p-6 relative overflow-hidden transition-theme cursor-pointer hover:border-primary/50 group/card`}
      onClick={() => { if (!isQuickEditing) onShowDetails?.(asset.id) }}
    >
      {/* Background glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none ${showSellAlert ? "from-destructive" : showBuyAlert ? "from-accent" : isStale ? "from-muted" : "from-primary"
          } to-transparent`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{asset.name}</h3>
            <p className="text-sm text-muted-foreground">Meta: {asset.targetPercentage}%</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={(e) => { e.stopPropagation(); setIsQuickEditing(!isQuickEditing); }}
                variant="ghost"
                size="icon"
                aria-label="Atualização rápida"
                className={cn(
                  "h-8 w-8 transition-colors duration-150 rounded-md",
                  isQuickEditing ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <RefreshCcw className={cn("h-4 w-4", isQuickEditing && "animate-spin")} style={{ animationIterationCount: 1, animationDuration: '0.5s' }} />
              </Button>
              {onEdit && !isQuickEditing && (
                <Button
                  onClick={(e) => { e.stopPropagation(); onEdit(asset) }}
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${asset.name}`}
                  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && !isQuickEditing && (
                <Button
                  onClick={(e) => { e.stopPropagation(); onDelete(asset.id) }}
                  variant="ghost"
                  size="icon"
                  aria-label={`Excluir ${asset.name}`}
                  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {showSellAlert && (
              <Badge className="bg-danger/20 text-danger hover:bg-danger/30 border-danger/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                VENDER
              </Badge>
            )}
            {showBuyAlert && (
              <Badge className="bg-success/20 text-success hover:bg-success/30 border-success/50">
                <TrendingUp className="h-3 w-3 mr-1" />
                COMPRAR
              </Badge>
            )}
            {isStale && !showSellAlert && !showBuyAlert && (
              <Badge className="bg-muted-foreground/20 text-muted-foreground border-muted-foreground/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Preço Antigo
              </Badge>
            )}
            {Math.abs(difference) < 2 && !showSellAlert && !showBuyAlert && !isStale && (
              <Badge className="bg-primary/20 text-primary border-primary/50">✓ Balanceado</Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
            <div className="flex-1 w-full min-w-0">
              {isQuickEditing ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Preço</label>
                      <Input
                        type="number"
                        value={quickForm.price}
                        onChange={(e) => setQuickForm({ ...quickForm, price: e.target.value })}
                        className="h-8 text-xs bg-muted/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Qtd.</label>
                      <Input
                        type="number"
                        value={quickForm.quantity}
                        onChange={(e) => setQuickForm({ ...quickForm, quantity: e.target.value })}
                        className="h-8 text-xs bg-muted/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleQuickSave} size="sm" className="h-8 flex-1 bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 mr-1" /> Salvar
                    </Button>
                    <Button onClick={() => setIsQuickEditing(false)} size="sm" variant="outline" className="h-8 px-2">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={cn("text-lg sm:text-xl font-bold text-foreground")}>
                    <NumberTicker value={asset.currentValue} currency isPrivate={isPrivate} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={cn("text-xs text-muted-foreground", isPrivate && "blur-sm select-none")}>
                      Investido: {formatCurrency(totalCost)}
                    </p>
                    <Badge variant="outline" className={cn(
                      "text-[10px] py-0 px-1.5 h-4 font-bold border-none",
                      totalGain >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                      {totalGain >= 0 ? "+" : ""}{rentabilidade.toFixed(1)}%
                    </Badge>
                  </div>
                </>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{currentPercentage.toFixed(1)}%</p>
              <p
                className="text-sm font-medium"
                style={{
                  color: difference > 0 ? "var(--success)" : difference < 0 ? "var(--danger)" : "var(--muted-foreground)",
                }}
              >
                {difference > 0 ? "+" : ""}
                {difference.toFixed(1)}% da meta
              </p>
            </div>
          </div>

          {yoc > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Yield on Cost</span>
              </div>
              <span className="text-sm font-bold text-foreground">{yoc.toFixed(2)}%</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progressValue.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progressValue, 100)}%`,
                  backgroundColor: getAssetBarColor(asset.currentValue, totalNetWorth * (asset.targetPercentage / 100))
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
})
