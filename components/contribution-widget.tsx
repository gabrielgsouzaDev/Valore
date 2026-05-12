"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight } from "lucide-react"
import { calculateInvestmentDistribution } from "@/lib/services"
import { useApp } from "@/contexts/app-context"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"
import type { Asset } from "@/lib/types"

interface ContributionWidgetProps {
  assets: Asset[]
  totalNetWorth: number
  initialAmount?: number
}

export function ContributionWidget({ assets, totalNetWorth, initialAmount }: ContributionWidgetProps) {
  const { settings } = useApp()
  const [contribution, setContribution] = useState(initialAmount?.toString() || "")
  const [recommendations, setRecommendations] = useState<{ name: string; amount: number }[]>([])

  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      setContribution(initialAmount.toString())
      const strategy = settings.investmentStrategy || "rebalance"
      const recs = calculateInvestmentDistribution(initialAmount, assets, totalNetWorth, strategy)
      setRecommendations(recs)
    }
  }, [initialAmount, assets, totalNetWorth, settings.investmentStrategy])

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
              type={settings.isPrivate ? "password" : "number"}
              placeholder="R$ 0,00"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className={cn(
                "bg-muted border-border text-foreground placeholder:text-muted-foreground transition-all",
                settings.isPrivate && "blur-sm select-none"
              )}
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
                <span className={cn("text-sm font-medium text-foreground", settings.isPrivate && "blur-sm select-none")}>
                  {rec.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      rec.amount > 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {rec.amount > 0 ? "+" : ""}
                    <NumberTicker value={rec.amount} currency isPrivate={settings.isPrivate} />
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
