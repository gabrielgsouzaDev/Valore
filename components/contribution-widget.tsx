"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight } from "lucide-react"
import { calculateInvestmentDistribution } from "@/lib/services"

interface Asset {
  id: number
  name: string
  targetPercentage: number
  currentValue: number
}

import { useApp } from "@/contexts/app-context"

export function ContributionWidget({ assets, totalNetWorth }: ContributionWidgetProps) {
  const { settings } = useApp()
  const [contribution, setContribution] = useState("")
  const [recommendations, setRecommendations] = useState<{ name: string; amount: number }[]>([])

  const calculateDistribution = () => {
    const amount = Number.parseFloat(contribution)
    if (isNaN(amount) || amount <= 0) return

    const strategy = settings.investmentStrategy || "rebalance"
    let recs: { name: string; amount: number }[] = []

    if (strategy === "rebalance") {
      const futureTotal = totalNetWorth + amount
      recs = assets.map((asset) => {
        const targetValue = futureTotal * (asset.targetPercentage / 100)
        const toBuy = targetValue - asset.currentValue
        return {
          name: asset.name,
          amount: Math.max(0, toBuy),
        }
      })

      // Ajuste proporcional se o toBuy total for diferente do aporte (devido ao Math.max)
      const totalToBuy = recs.reduce((sum, r) => sum + r.amount, 0)
      if (totalToBuy > 0) {
        recs = recs.map(r => ({
          ...r,
          amount: (r.amount / totalToBuy) * amount
        }))
      }
    } else if (strategy === "proportional") {
      recs = assets.map((asset) => ({
        name: asset.name,
        amount: amount * (asset.targetPercentage / 100),
      }))
    } else if (strategy === "waterfall") {
      let remaining = amount
      const sortedAssets = [...assets].sort((a, b) => b.targetPercentage - a.targetPercentage)

      recs = sortedAssets.map((asset) => {
        if (remaining <= 0) return { name: asset.name, amount: 0 }

        const targetValue = (totalNetWorth + amount) * (asset.targetPercentage / 100)
        const needed = Math.max(0, targetValue - asset.currentValue)
        const toAllocate = Math.min(remaining, needed)

        remaining -= toAllocate
        return { name: asset.name, amount: toAllocate }
      })

      // Se sobrar algo após o waterfall, distribui proporcionalmente no final
      if (remaining > 0) {
        recs = recs.map(r => {
          const asset = assets.find(a => a.name === r.name)
          const weight = (asset?.targetPercentage || 0) / 100
          return { ...r, amount: r.amount + (remaining * weight) }
        })
      }
    }

    setRecommendations(recs.filter(r => r.amount > 0.01))
  }

  return (
    <Card className="bg-card border-border p-6 transition-theme">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Distribuição Inteligente</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
          {settings.investmentStrategy === "rebalance" ? "Rebalance" :
            settings.investmentStrategy === "proportional" ? "Proporcional" : "Cascata"}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Valor a Investir</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={calculateDistribution}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-theme font-medium"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground">Recomendações:</p>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
              >
                <span className="text-sm font-medium text-foreground">{rec.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${rec.amount > 0 ? "text-emerald-400 dark:text-emerald-300" : "text-red-400 dark:text-red-300"
                      }`}
                  >
                    {rec.amount > 0 ? "+" : ""}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(rec.amount)}
                  </span>
                  {rec.amount > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
