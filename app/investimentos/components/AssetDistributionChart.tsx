"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TaxReport } from "@/components/tax-report"
import type { Asset } from "@/lib/types"

/**
 * Props para o componente de gráfico de distribuição de ativos.
 */
interface AssetDistributionChartProps {
    /** Lista completa de ativos para o relatório de IR. */
    assets: Asset[]
    /** Dados formatados para o gráfico de pizza. */
    distributionData: { name: string; value: number }[]
    /** Patrimônio líquido total para cálculo de porcentagens. */
    totalNetWorth: number
    /** Indica se os valores sensíveis devem ser ocultados. */
    isPrivate: boolean
}

/**
 * Renderiza a distribuição da carteira em um gráfico de pizza (Donut).
 * Inclui um acionador para o relatório de Bens e Direitos (IR).
 */
export function AssetDistributionChart({
    assets,
    distributionData,
    totalNetWorth,
    isPrivate
}: AssetDistributionChartProps) {
    return (
        <Card className="bg-card border-border p-6 shadow-sm overflow-hidden relative">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Distribuição de Ativos</h3>
            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={distributionData.length > 0 ? distributionData : [{ name: "Nenhum", value: 1 }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={83}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {distributionData.length > 0 ?
                                distributionData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill="var(--primary)"
                                        fillOpacity={Math.max(0.2, (100 - (index * 15)) / 100)}
                                        stroke="var(--card)"
                                        strokeWidth={2}
                                    />
                                ))
                                : <Cell fill="var(--muted)" />}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)",
                                borderRadius: "12px",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                borderWidth: "1px"
                            }}
                            itemStyle={{ color: "var(--foreground)", fontSize: "11px", fontWeight: "800" }}
                            formatter={(value: number) => isPrivate ? "***" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 mt-6 justify-center">
                {distributionData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 bg-muted/20 px-2 py-0.5 rounded border border-border/40">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--primary)", opacity: Math.max(0.2, (100 - (i * 15)) / 100) }} />
                        <span className="text-[9px] font-black text-foreground uppercase tracking-tighter">{item.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                            {totalNetWorth > 0 ? ((item.value / totalNetWorth) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                ))}
            </div>

            {/* IR Report Trigger - More subtle as requested */}
            <div className="absolute top-4 right-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors opacity-40 hover:opacity-100" title="Relatório de Bens">
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0 sm:p-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Declaração de Bens</DialogTitle>
                            <DialogDescription>Consolidado de ativos para fins de Imposto de Renda</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 pt-0">
                            <TaxReport assets={assets} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    )
}
