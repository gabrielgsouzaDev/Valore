"use client"

import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { formatCurrency } from "@/lib/services"

export function BudgetComparison() {
    const { categories, currentTheme } = useApp()

    // Formata os dados para o gráfico
    const chartData = categories.map((cat) => ({
        name: cat.name,
        planejado: cat.budgeted,
        realizado: cat.spent,
    })).filter(d => d.planejado > 0 || d.realizado > 0)

    const primaryColor = `rgb(${currentTheme.colors.primary})`
    const accentColor = `rgb(${currentTheme.colors.accent})`
    const bgColor = `rgb(${currentTheme.colors.background})`
    const borderColor = `rgb(${currentTheme.colors.border})`
    const gridColor = `rgba(${currentTheme.colors.muted}, 0.2)`

    return (
        <Card className="bg-card border-border p-6 transition-theme h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6">Orçado vs Realizado</h3>

            {chartData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground text-sm max-w-[200px]">
                        Defina orçamentos nas suas categorias para visualizar o comparativo.
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke={`rgb(${currentTheme.colors.mutedForeground})`}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke={`rgb(${currentTheme.colors.mutedForeground})`}
                            fontSize={11}
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
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar dataKey="planejado" name="Orçado" fill={`rgb(${currentTheme.colors.muted})`} radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="realizado" name="Realizado" radius={[4, 4, 0, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.realizado > entry.planejado ? `rgb(${currentTheme.colors.danger})` : primaryColor}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    )
}
