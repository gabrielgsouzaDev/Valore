"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { CalendarDays, TrendingUp } from "lucide-react"

interface InvoiceProjectionProps {
    data: { name: string; total: number; breakdown?: Record<string, number> }[]
    formatCurrency: (val: number) => string
}

export function InvoiceProjection({
    data,
    formatCurrency
}: InvoiceProjectionProps) {
    const totalProjected = data.reduce((sum, d) => sum + d.total, 0)
    const averageProjected = totalProjected / (data.length || 1)
    const maxMonth = [...data].sort((a, b) => b.total - a.total)[0]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border p-4 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Total Acumulado</span>
                    <span className="text-xl font-black italic tracking-tighter text-foreground">{formatCurrency(totalProjected)}</span>
                </Card>
                <Card className="bg-card border-border p-4 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-all" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Média Mensal</span>
                    <span className="text-xl font-black italic tracking-tighter text-foreground">{formatCurrency(averageProjected)}</span>
                </Card>
                <Card className="bg-card border-border p-4 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-danger/5 rounded-full blur-xl group-hover:bg-danger/10 transition-all" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Pico (Fatura {maxMonth?.name})</span>
                    <span className="text-xl font-black italic tracking-tighter text-danger">{formatCurrency(maxMonth?.total || 0)}</span>
                </Card>
            </div>

            <Card className="bg-card border-border overflow-hidden">
                <CardHeader className="p-4 sm:p-6 bg-muted/30 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground text-base font-black tracking-tight uppercase italic font-black">
                                <CalendarDays className="h-5 w-5 text-primary" />
                                Projeção de Fluxo de Caixa
                            </CardTitle>
                            <CardDescription className="text-xs font-bold opacity-60 uppercase tracking-widest mt-0.5">Visão de compenetração de parcelas futuras</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        <div className="lg:col-span-3 p-4 sm:p-6">
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 900 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload
                                                    return (
                                                        <div className="bg-card border border-border p-3 rounded-xl shadow-2xl backdrop-blur-xl border-primary/20 min-w-[200px]">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 border-b border-border/50 pb-1">
                                                                Fatura de {d.name}
                                                            </p>
                                                            <div className="space-y-1.5 mt-2">
                                                                {d.breakdown && Object.entries(d.breakdown).map(([card, val]) => (
                                                                    <div key={card} className="flex items-center justify-between gap-4">
                                                                        <span className="text-[10px] font-bold text-muted-foreground max-w-[100px] truncate">{card}</span>
                                                                        <span className="text-[10px] font-black text-foreground">{formatCurrency(val as number)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                                                                <span className="text-[10px] font-black uppercase text-foreground">Total</span>
                                                                <span className="text-xs font-black italic text-foreground">{formatCurrency(d.total)}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                            cursor={{ fill: "var(--primary)", opacity: 0.1 }}
                                        />
                                        <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                                            {data.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill="var(--primary)"
                                                    fillOpacity={index === 0 ? 1 : 0.3 + (index * 0.1)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 p-4 sm:p-6 bg-muted/10 h-full">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Detalhamento por Cartão</h4>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {data[0]?.breakdown && Object.entries(data[0].breakdown).map(([card, val]) => (
                                    <div key={card} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{card}</span>
                                            <span className="text-xs font-black text-foreground">{formatCurrency(val)}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000"
                                                style={{ width: `${(val / (data[0].total || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!data[0]?.breakdown || Object.keys(data[0].breakdown).length === 0) && (
                                    <p className="text-xs text-muted-foreground italic text-center py-10">Nenhum gasto projetado para o próximo mês.</p>
                                )}
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-0.5">Alerta de Fluxo</p>
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                        Sua maior fatura está prevista para <span className="text-foreground font-bold">{maxMonth?.name}</span>. Representa <span className="font-bold text-foreground">{((maxMonth?.total || 0) / (totalProjected || 1) * 100).toFixed(0)}%</span> do total acumulado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
