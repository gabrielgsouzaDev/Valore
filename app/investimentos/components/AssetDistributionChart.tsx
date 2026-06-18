"use client"

import { Card } from "@/components/ui/card"
import { PieChart as PieChartIcon } from "lucide-react"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/services"

// Dynamic Recharts (Performance Rule #5) — types coerced via recharts-dynamic wrapper
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "@/lib/recharts-dynamic"

interface AssetDistributionChartProps {
    distributionData: { name: string; value: number }[]
    totalNetWorth: number
    isPrivate: boolean
    isLoading?: boolean
}

const COLORS = [
    "rgb(var(--theme-primary))",
    "rgb(var(--theme-success))",
    "rgb(var(--theme-danger))",
    "rgb(var(--theme-warning))",
    "rgb(var(--theme-accent))",
]

export function AssetDistributionChart({
    distributionData,
    isPrivate,
    isLoading,
}: AssetDistributionChartProps) {
    if (isLoading) {
        return <SkeletonCard variant="chart" className="h-[400px]" />
    }

    const total = distributionData.reduce((sum, d) => sum + d.value, 0)
    const hasData = distributionData.length > 0 && total > 0
    const chartData = isPrivate ? [{ name: "Privado", value: 1 }] : (hasData ? distributionData : [{ name: "Nenhum", value: 1 }])

    return (
        <Card className="p-4 sm:p-6 bg-card border-border shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4" /> Distribuição de Ativos
                </h3>
            </div>

            {/* Donut com total no centro */}
            <div className="relative h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={64}
                            outerRadius={88}
                            paddingAngle={hasData ? 3 : 0}
                            dataKey="value"
                            stroke="rgb(var(--theme-card))"
                            strokeWidth={3}
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={isPrivate || !hasData ? "rgb(var(--theme-muted))" : COLORS[index % COLORS.length]}
                                    fillOpacity={1}
                                />
                            ))}
                        </Pie>
                        {hasData && !isPrivate && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgb(var(--theme-card))",
                                    borderColor: "rgb(var(--theme-border))",
                                    borderRadius: "10px",
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                    borderWidth: "1px",
                                    fontFamily: "var(--font-mono)",
                                }}
                                itemStyle={{ color: "var(--foreground)", fontSize: "11px", fontWeight: "700" }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>

                {/* Total no centro */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1">Total</span>
                    <span className={cn("font-mono text-lg font-black text-foreground tabular-nums leading-none", isPrivate && "blur-sm select-none")}>
                        {isPrivate ? "•••" : formatCurrency(total)}
                    </span>
                </div>
            </div>

            {/* Legenda em lista: cor · tipo · valor · % */}
            <div className="mt-5 space-y-1.5">
                {hasData ? distributionData.map((item, i) => {
                    const pct = total > 0 ? (item.value / total) * 100 : 0
                    return (
                        <div key={item.name} className="flex items-center gap-2.5">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-[11px] font-black uppercase tracking-tight text-foreground flex-1 truncate">{item.name}</span>
                            <span className={cn("font-mono text-[11px] font-bold text-muted-foreground tabular-nums", isPrivate && "blur-sm select-none")}>
                                {isPrivate ? "•••" : formatCurrency(item.value)}
                            </span>
                            <span className="font-mono text-[11px] font-black text-foreground tabular-nums w-9 text-right">
                                {pct.toFixed(0)}%
                            </span>
                        </div>
                    )
                }) : (
                    <p className="text-[11px] text-muted-foreground text-center py-2">Nenhum ativo para exibir.</p>
                )}
            </div>
        </Card>
    )
}
