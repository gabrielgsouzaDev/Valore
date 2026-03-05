"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, Pencil, Trash2 } from "lucide-react"

interface Asset {
  id: number
  name: string
  targetPercentage: number
  currentValue: number
  priority?: number
  lastUpdated?: string
}

interface AssetCardProps {
  asset: Asset
  totalNetWorth: number
  onEdit?: () => void
  onDelete?: () => void
}

export function AssetCard({ asset, totalNetWorth, onEdit, onDelete }: AssetCardProps) {
  const currentPercentage = (asset.currentValue / totalNetWorth) * 100
  const difference = currentPercentage - asset.targetPercentage
  const progressValue = (currentPercentage / asset.targetPercentage) * 100

  // Alert logic for stale prices and Bitcoin
  const isBitcoin = asset.name === "Bitcoin"
  const showSellAlert = isBitcoin && currentPercentage > 25
  const showBuyAlert = isBitcoin && currentPercentage < 15

  const isStale = asset.lastUpdated
    ? (new Date().getTime() - new Date(asset.lastUpdated).getTime()) > 7 * 24 * 60 * 60 * 1000
    : true

  const getBorderColor = () => {
    if (showSellAlert) return "border-destructive"
    if (showBuyAlert) return "border-accent"
    if (isStale) return "border-amber-500/50"
    if (Math.abs(difference) < 2) return "border-emerald-500"
    return "border-border"
  }

  const getAlertColor = () => {
    if (showSellAlert) return "rgb(248 113 113)"
    if (showBuyAlert) return "rgb(34 211 238)"
    return "rgb(52 211 153)"
  }

  return (
    <Card className={`bg-card ${getBorderColor()} border-2 p-6 relative overflow-hidden transition-theme`}>
      {/* Background glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none ${showSellAlert ? "from-red-500" : showBuyAlert ? "from-cyan-500" : isStale ? "from-amber-500" : "from-emerald-500"
          } to-transparent`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{asset.name}</h3>
            <p className="text-sm text-muted-foreground">Meta: {asset.targetPercentage}%</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-accent transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {showSellAlert && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                VENDER
              </Badge>
            )}
            {showBuyAlert && (
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                <TrendingUp className="h-3 w-3 mr-1" />
                COMPRAR
              </Badge>
            )}
            {isStale && !showSellAlert && !showBuyAlert && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Preço Antigo
              </Badge>
            )}
            {Math.abs(difference) < 2 && !showSellAlert && !showBuyAlert && !isStale && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">✓ Balanceado</Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(asset.currentValue)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {asset.quantity} {asset.name === "Bitcoin" ? "BTC" : "cotas"} ×{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(asset.price)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{currentPercentage.toFixed(1)}%</p>
              <p
                className="text-sm font-medium"
                style={{
                  color: difference > 0 ? "rgb(34 211 238)" : difference < 0 ? "rgb(248 113 113)" : "rgb(148 163 184)",
                }}
              >
                {difference > 0 ? "+" : ""}
                {difference.toFixed(1)}% da meta
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progressValue.toFixed(0)}%</span>
            </div>
            <Progress
              value={Math.min(progressValue, 100)}
              className="h-2 bg-muted"
              indicatorClassName={showSellAlert ? "bg-red-500" : showBuyAlert ? "bg-cyan-500" : "bg-emerald-500"}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
