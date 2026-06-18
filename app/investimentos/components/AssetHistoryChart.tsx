"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/services"
// Dynamic Recharts (Performance Rule #5) — types coerced via recharts-dynamic wrapper
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "@/lib/recharts-dynamic"

interface AssetHistoryChartProps {
    ticker: string
    currentPrice: number
    isPrivate?: boolean
}

export function AssetHistoryChart({ ticker, currentPrice, isPrivate = false }: AssetHistoryChartProps) {
    const history = useLiveQuery(
        () => db.table("assetHistory")
            .where("ticker")
            .equals(ticker)
            .limit(30)
            .toArray()
        , [ticker])

    const data = (history && history.length > 1)
        ? history.map(h => ({ price: h.price, time: h.timestamp }))
        : [
            { price: currentPrice * 0.98, time: Date.now() - 3000 },
            { price: currentPrice * 0.99, time: Date.now() - 2000 },
            { price: currentPrice * 1.01, time: Date.now() - 1000 },
            { price: currentPrice, time: Date.now() }
        ]

    const minPrice = Math.min(...data.map(d => d.price)) * 0.999
    const maxPrice = Math.max(...data.map(d => d.price)) * 1.001

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tendência (Sparkline)</h4>
                <span className="text-[8px] font-bold text-muted-foreground uppercase bg-muted/50 px-1.5 rounded">Live Accumulation</span>
            </div>

            <div className="h-32 w-full bg-muted/20 rounded-2xl border border-border/40 p-2 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={({ active, payload }: { active?: boolean; payload?: Array<{ value?: unknown }> }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-popover border border-border p-2 rounded-lg shadow-xl text-[10px] font-black uppercase">
                                            <span className={isPrivate ? "blur-sm select-none" : ""}>
                                                {formatCurrency(payload[0].value as number)}
                                            </span>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <YAxis hide domain={[minPrice, maxPrice]} />
                        <XAxis hide dataKey="time" />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
