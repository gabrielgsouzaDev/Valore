"use client"

import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/services"

export function HistoryChart() {
    const { patrimonialHistory, currentTheme } = useApp()

    // Formata os dados para o gráfico
    const chartData = patrimonialHistory.map((s) => ({
        date: new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: s.totalNetWorth,
    }))

    const primaryColor = `rgb(${currentTheme.colors.primary})`
    const accentColor = `rgb(${currentTheme.colors.accent})`
    const bgColor = `rgb(${currentTheme.colors.background})`
    const borderColor = `rgb(${currentTheme.colors.border})`
    const gridColor = `rgba(${currentTheme.colors.muted}, 0.2)`

    return (
        <Card className="bg-card border-border p-6 transition-theme h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Evolução Patrimonial</h3>
                <div className="text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    {chartData.length} snapshots capturados
                </div>
            </div>

            {chartData.length < 2 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-[200px]">
                        Aguardando mais dados históricos para gerar o gráfico de evolução.
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke={`rgb(${currentTheme.colors.mutedForeground})`}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke={`rgb(${currentTheme.colors.mutedForeground})`}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: bgColor,
                                border: `1px solid ${borderColor}`,
                                borderRadius: "0.5rem",
                            }}
                            formatter={(value: number) => [formatCurrency(value), "Patrimônio"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="valor"
                            stroke={primaryColor}
                            strokeWidth={3}
                            dot={{ r: 4, fill: primaryColor, strokeWidth: 2, stroke: bgColor }}
                            activeDot={{ r: 6, fill: accentColor, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    )
}
