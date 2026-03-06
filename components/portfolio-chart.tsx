"use client"

import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Asset {
  name: string
  currentValue: number
  targetPercentage: number
}

interface PortfolioChartProps {
  assets: Asset[]
  totalNetWorth: number
}

export function PortfolioChart({ assets, totalNetWorth }: PortfolioChartProps) {
  const { currentTheme } = useApp()

  const chartData = assets.map((asset) => ({
    name: asset.name,
    value: asset.currentValue,
    percentage: ((asset.currentValue / totalNetWorth) * 100).toFixed(1),
  }))

  const chartColors = [
    `rgb(${currentTheme.colors.primary})`,
    `rgb(${currentTheme.colors.accent})`,
    `rgb(${currentTheme.colors.success})`,
  ]

  const bgColor = `rgb(${currentTheme.colors.background})`
  const borderColor = `rgb(${currentTheme.colors.border})`
  const textColor = "rgb(226 232 240)"

  return (
    <Card className="bg-card border-border p-6 transition-theme">
      <h3 className="text-lg font-semibold text-foreground mb-4">Composição Atual</h3>
      {assets.length === 0 ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/10">
          <p className="text-muted-foreground text-sm">Nenhum ativo para exibir composição.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  stroke={bgColor}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "0.5rem",
                color: textColor,
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="space-y-2 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-semibold text-foreground">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
