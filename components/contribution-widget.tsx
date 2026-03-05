"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight } from "lucide-react"
import { calculateInvestmentDistribution } from "@/lib/services"
import { useApp } from "@/contexts/app-context"
import { cn } from "@/lib/utils"

interface Asset {
  id: number
  name: string
  targetPercentage: number
  currentValue: number
}

interface ContributionWidgetProps {
  assets: Asset[]
  totalNetWorth: number
}

export function ContributionWidget({ assets, totalNetWorth }: ContributionWidgetProps) {
  const { settings } = useApp()
  const [contribution, setContribution] = useState("")
  const [recommendations, setRecommendations] = useState<{ name: string; amount: number }[]>([])

  const calculateDistribution = () => {
    const amount = Number.parseFloat(contribution)
    if (isNaN(amount) || amount <= 0) return

    const strategy = settings.investmentStrategy || "rebalance"
    const recs = calculateInvestmentDistribution(amount, assets, totalNetWorth, strategy)

    setRecommendations(recs)
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
                    className={cn(
                      "text-sm font-bold",
                      rec.amount > 0 ? "text-emerald-400 dark:text-emerald-300" : "text-red-400 dark:text-red-300"
                    )}
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
