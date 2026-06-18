"use client"

import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/services"
import { cn } from "@/lib/utils"
import type { MarketData } from "@/lib/types"

interface AssetMarketStatsProps {
    data: MarketData
    isPrivate?: boolean
}

export function AssetMarketStats({ data, isPrivate = false }: AssetMarketStatsProps) {
    const stats = [
        {
            label: "Valor de Mercado",
            value: data.marketCap ? formatCompactNumber(data.marketCap) : "N/A",
            detail: "Market Cap"
        },
        {
            label: "Volume (24h)",
            value: data.regularMarketVolume ? formatCompactNumber(data.regularMarketVolume) : "N/A",
            detail: "Volume de Negociação"
        },
        {
            label: "Abertura",
            value: data.regularMarketOpen ? formatCurrency(data.regularMarketOpen) : "N/A",
            detail: "Preço no início do dia"
        },
        {
            label: "Fech. Anterior",
            value: data.regularMarketPreviousClose ? formatCurrency(data.regularMarketPreviousClose) : "N/A",
            detail: "Preço de ontem"
        },
    ]

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estatísticas de Mercado</h4>
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none">{stat.label}</p>
                        <p className={cn("text-sm font-black text-foreground", isPrivate && "blur-sm select-none")}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Formata números grandes (Bilhões, Milhões) para leitura fácil.
 */
function formatCompactNumber(number: number): string {
    const formatter = Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1,
    })
    return formatter.format(number)
}
