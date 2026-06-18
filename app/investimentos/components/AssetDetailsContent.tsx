"use client"

import type { Asset, MarketData } from "@/lib/types"
import { useAssetDetail } from "../hooks/useAssetDetail"
import { AssetUserStats } from "./AssetUserStats"
import { AssetMarketStats } from "./AssetMarketStats"
import { DayRangeSlider } from "./DayRangeSlider"
import { AssetHistoryChart } from "./AssetHistoryChart"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/services"
import { TrendingUp, TrendingDown, Clock, Database } from "lucide-react"
import { cn } from "@/lib/utils"

// Usando alias para evitar conflito se necessário (mas aqui é simples)
const BadgeComponent = Badge

interface AssetDetailsContentProps {
    assetId: number
    isPrivate?: boolean
    isLoading: boolean
    asset: Asset
    marketData: MarketData | null
    error: string | null
}

export function AssetDetailsContent({ assetId, isPrivate = false, asset, marketData, isLoading, error }: AssetDetailsContentProps) {
    if (!asset) return <div className="p-10 flex justify-center"><SkeletonCard variant="full" className="h-64" /></div>

    return (
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh] modern-scrollbar pb-10 sm:pb-6">
            {/* Seção do Usuário (Sempre visível) */}
            <AssetUserStats asset={asset} isPrivate={isPrivate} />

            {/* Variação do Dia (Brapi) */}
            {marketData && (
                <DayRangeSlider
                    min={marketData.regularMarketDayLow}
                    max={marketData.regularMarketDayHigh}
                    current={marketData.regularMarketPrice}
                    isPrivate={isPrivate}
                />
            )}

            {/* Estatísticas de Mercado (Brapi) */}
            {marketData && <AssetMarketStats data={marketData} isPrivate={isPrivate} />}

            {/* Gráfico de Histórico */}
            {asset.ticker && (
                <AssetHistoryChart
                    ticker={asset.ticker}
                    currentPrice={marketData?.regularMarketPrice || asset.price}
                    isPrivate={isPrivate}
                />
            )}

            {/* Loading State Market */}
            {isLoading && !marketData && (
                <div className="space-y-4">
                    <SkeletonCard variant="list-item" className="h-20" />
                    <SkeletonCard variant="list-item" className="h-32" />
                </div>
            )}

            {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-bold text-center">
                    {error}
                </div>
            )}

            {/* Rodapé Interno */}
            <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
                {marketData && (
                    <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-warning">
                            <Clock className="h-2.5 w-2.5 " />
                            <span>Brapi Free Plan: ~15 min delay</span>
                        </div>
                        <span>{marketData.updatedAt ? new Date(marketData.updatedAt).toLocaleTimeString() : "--:--"}</span>
                    </div>
                )}
                <p className="text-[8px] text-center text-muted-foreground leading-relaxed uppercase tracking-tighter">
                    Valore Híbrido Engine — Conexão Direta DexieDB & Brapi API
                </p>
            </div>
        </div>
    )
}

interface AssetDetailsHeaderProps {
    asset: Asset
    marketData: MarketData | null
    isPrivate?: boolean
}

export function AssetDetailsHeader({ asset, marketData, isPrivate }: AssetDetailsHeaderProps) {
    if (!asset) return <div className="h-12 w-full animate-pulse bg-muted rounded-lg" />

    return (
        <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4 text-left">
                {marketData?.logourl ? (
                    <img
                        src={marketData.logourl}
                        alt={asset.name}
                        className="h-12 w-12 rounded-2xl bg-card border border-border p-1.5 object-contain shadow-sm"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black uppercase shadow-sm border border-primary/20">
                        {asset.ticker?.substring(0, 2) || asset.name?.substring(0, 2) || "AT"}
                    </div>
                )}
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <BadgeComponent variant="outline" className="text-[10px] font-black tracking-tighter uppercase px-1.5 h-4 bg-background">
                            {asset.type}
                        </BadgeComponent>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            {marketData ? <TrendingUp className="h-2 w-2" /> : <Database className="h-2 w-2" />}
                            {marketData ? "API Realtime" : "Ativo Manual"}
                        </span>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">
                        {asset.ticker || asset.name}
                    </h2>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase truncate max-w-[150px] sm:max-w-[200px]">
                        {marketData?.longName || asset.name}
                    </p>
                </div>
            </div>

            {marketData && (
                <div className="text-right space-y-1">
                    <p className={`text-xl font-black text-foreground ${isPrivate ? "blur-md" : ""}`}>
                        {formatCurrency(marketData.regularMarketPrice)}
                    </p>
                    <div className={cn("flex items-center justify-end gap-1 font-bold text-[10px]", marketData.regularMarketChange >= 0 ? "text-success" : "text-danger", isPrivate && "blur-sm select-none")}>
                        {marketData.regularMarketChange >= 0 ? "+" : ""}
                        {marketData.regularMarketChangePercent.toFixed(2)}%
                        {marketData.regularMarketChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </div>
                </div>
            )}
        </div>
    )
}
