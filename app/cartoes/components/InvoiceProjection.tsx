"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { CalendarDays, TrendingUp } from "lucide-react"

interface InvoiceProjectionProps {
    data: { name: string; total: number }[]
    formatCurrency: (val: number) => string
}

export function InvoiceProjection({
    data,
    formatCurrency
}: InvoiceProjectionProps) {
    const totalProjected = data.reduce((sum, d) => sum + d.total, 0)

    return (
        <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="p-4 sm:p-6 bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg font-black tracking-tight uppercase italic">
                            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Projeção de Faturas
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm font-medium opacity-70">Previsão de gastos parcelados nos próximos meses</CardDescription>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Projetado</span>
                        <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-foreground">{formatCurrency(totalProjected)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 700 }}
                            />
                            <YAxis hide />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-card border border-border p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                                    {payload[0].payload.name}
                                                </p>
                                                <p className="text-sm font-black italic text-foreground">
                                                    {formatCurrency(payload[0].value as number)}
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                                cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                            />
                            <Bar
                                dataKey="total"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 0 ? "var(--primary)" : "var(--muted-foreground)"}
                                        opacity={index === 0 ? 1 : 0.4}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">Insight do Especialista</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            O mês de <span className="text-foreground font-black uppercase text-[10px]">{data[0]?.name}</span> concentra o maior volume de parcelas. Planeje sua reserva de liquidez para cobrir este vencimento.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
