"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/services"

interface ProjectionChartProps {
    data: Array<{
        name: string
        saldo: number
        originalDate: string
    }>
}

export function ProjectionChart({ data }: ProjectionChartProps) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden mb-6">
            <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        Projeção de Fluxo (30 dias)
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium italic opacity-70">
                        *Considerando apenas transações pendentes e agendadas.
                    </p>
                </div>
                <div className="h-[120px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                content={(props) => {
                                    const { active, payload } = props
                                    if (active && payload && payload.length) {
                                        const val = (payload[0].value ?? 0) as number
                                        const label = (payload[0].payload as { name: string }).name
                                        return (
                                            <div className="bg-card border border-border p-2 rounded-lg shadow-xl text-[10px] font-bold">
                                                <p className="text-muted-foreground">{label}</p>
                                                <p className={val >= 0 ? "text-success" : "text-danger"}>
                                                    {formatCurrency(val)}
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="saldo"
                                stroke="var(--theme-primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSaldo)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
