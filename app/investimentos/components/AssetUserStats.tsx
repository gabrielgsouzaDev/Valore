"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/services"
import { TrendingUp, TrendingDown, Target, Wallet, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Asset } from "@/lib/types"

interface AssetUserStatsProps {
    asset: Asset
    isPrivate?: boolean
}

export function AssetUserStats({ asset, isPrivate = false }: AssetUserStatsProps) {
    const totalCost = asset.quantity * asset.averagePrice
    const totalGain = asset.currentValue - totalCost
    const rentabilidade = asset.averagePrice > 0 ? ((asset.price / asset.averagePrice) - 1) * 100 : 0

    const stats = [
        {
            label: "Meu Portfolio",
            value: asset.currentValue,
            icon: <Wallet className="h-3 w-3" />,
            currency: true
        },
        {
            label: "Preço Médio",
            value: asset.averagePrice,
            icon: <Target className="h-3 w-3" />,
            currency: true
        },
        {
            label: "Quantidade",
            value: asset.quantity,
            icon: <TrendingUp className="h-3 w-3" />,
            currency: false
        },
        {
            label: "Rentabilidade",
            value: rentabilidade,
            icon: <Percent className="h-3 w-3" />,
            currency: false,
            percent: true
        }
    ]

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Minha Posição</h4>
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-card border border-border shadow-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            {stat.icon}
                            <span className="text-[10px] font-bold uppercase">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-1">
                            <p className={cn("text-sm font-black text-foreground", (isPrivate || i === 0) && "blur-sm select-none")}>
                                {stat.currency
                                    ? formatCurrency(stat.value)
                                    : stat.percent
                                        ? `${stat.value.toFixed(2)}%`
                                        : stat.value
                                }
                            </p>
                            {stat.percent && (
                                <Badge className={cn("h-4 text-[8px] font-bold px-1", stat.value >= 0 ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20", isPrivate && "blur-sm select-none")}>
                                    {stat.value >= 0 ? <TrendingUp className="h-2 w-2 mr-0.5" /> : <TrendingDown className="h-2 w-2 mr-0.5" />}
                                    {Math.abs(stat.value).toFixed(1)}%
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Lucro/Prejuízo Total</p>
                    <p className={`text-base font-black ${totalGain >= 0 ? "text-success" : "text-danger"} ${isPrivate ? "blur-md select-none" : ""}`}>
                        {formatCurrency(totalGain)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground text-right">Meta de Alocação</p>
                    <p className={cn("text-base font-black text-foreground", isPrivate && "blur-sm select-none")}>{asset.targetPercentage}%</p>
                </div>
            </div>
        </div>
    )
}
