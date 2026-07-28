"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { CalendarDays, TrendingUp } from "lucide-react"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import NumberTicker from "@/components/ui/number-ticker"
import { cn } from "@/lib/utils"
import type { ProjectionMonth } from "../hooks/useCardProjection"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface InvoiceProjectionProps {
    /** Dados de projeção calculados pelo hook useCardProjection. */
    data: ProjectionMonth[]
    /** Índice do mês atualmente selecionado no gráfico. */
    selectedMonthIndex: number
    /** Callback ao clicar em uma barra do gráfico. */
    onMonthSelect: (index: number) => void
    /** Formata valores monetários no padrão configurado. */
    formatCurrency: (val: number) => string
    /** Modo privado para ocultar valores sensíveis. */
    isPrivate: boolean
    /** Estado de carregamento. */
    isLoading?: boolean
}

// ─── Subcomponente: Tooltip do Gráfico ────────────────────────────────────────

interface ChartTooltipProps {
    active?: boolean
    payload?: { payload: ProjectionMonth }[]
    formatCurrency: (val: number) => string
    isPrivate: boolean
}

function ChartTooltip({ active, payload, formatCurrency, isPrivate }: ChartTooltipProps) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div className="bg-card border border-primary/20 p-3 rounded-xl shadow-2xl backdrop-blur-xl min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 border-b border-border/50 pb-1">
                Fatura de {d.name}
            </p>
            <div className="space-y-1.5 mt-2">
                {d.breakdown && Object.entries(d.breakdown).map(([card, val]) => (
                    <div key={card} className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-muted-foreground max-w-[100px] truncate">{card}</span>
                        <span className={cn("text-[10px] font-black text-foreground", isPrivate && "blur-sm select-none")}>
                            {formatCurrency(val)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-foreground">Total</span>
                <span className={cn("text-xs font-black text-foreground", isPrivate && "blur-sm select-none")}>
                    {formatCurrency(d.total)}
                </span>
            </div>
        </div>
    )
}

// ─── Subcomponente: Painel de Detalhamento ─────────────────────────────────────

interface MonthDetailPanelProps {
    month: ProjectionMonth
    totalProjected: number
    maxMonth: ProjectionMonth | undefined
    formatCurrency: (val: number) => string
    isPrivate: boolean
}

function MonthDetailPanel({ month, totalProjected, maxMonth, formatCurrency, isPrivate }: MonthDetailPanelProps) {
    const hasBreakdown = month.breakdown && Object.keys(month.breakdown).length > 0

    return (
        <div className="lg:col-span-2 p-4 sm:p-6 bg-muted/10 h-full flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Detalhamento — {month.name}
            </h4>

            <div className="space-y-4 flex-1 max-h-[260px] overflow-y-auto pr-2">
                {hasBreakdown
                    ? Object.entries(month.breakdown).map(([card, val]) => (
                        <div key={card} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{card}</span>
                                <span className={cn("text-xs font-black text-foreground", isPrivate && "blur-sm select-none")}>
                                    {formatCurrency(val)}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-700"
                                    style={{ width: `${(val / (month.total || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))
                    : (
                        <p className="text-xs text-muted-foreground italic text-center py-10">
                            Nenhum gasto projetado para {month.name}.
                        </p>
                    )
                }
            </div>

            {/* Alerta de Fluxo — oculto quando não há dados (fix G4) */}
            {totalProjected > 0 && maxMonth && (
                <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-warning/10 text-warning shrink-0">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-warning mb-0.5">Alerta de Fluxo</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Sua maior fatura está prevista para{" "}
                            <span className="text-foreground font-bold">{maxMonth.name}</span>.
                            Representa{" "}
                            <span className="font-bold text-foreground">
                                {((maxMonth.total / totalProjected) * 100).toFixed(0)}%
                            </span>{" "}
                            do total acumulado.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

/**
 * Exibe a projeção de faturas de cartão de crédito com gráfico interativo.
 *
 * O gráfico e o painel lateral são sincronizados via `selectedMonthIndex`:
 * clicar em uma barra atualiza o detalhamento de cartões exibido. (fix B1)
 *
 * @param data - Array de meses projetados com totais e breakdown por cartão.
 * @param selectedMonthIndex - Índice do mês selecionado atualmente.
 * @param onMonthSelect - Callback invocado ao selecionar um mês no gráfico.
 * @param formatCurrency - Função de formatação monetária.
 */
export function InvoiceProjection({
    data,
    selectedMonthIndex,
    onMonthSelect,
    formatCurrency,
    isPrivate,
    isLoading
}: InvoiceProjectionProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} variant="summary" />)}
                </div>
                <SkeletonCard variant="chart" className="h-[400px]" />
            </div>
        )
    }

    const totalProjected = data.reduce((sum, d) => sum + d.total, 0)
    const averageProjected = totalProjected / (data.length || 1)
    const maxMonth = [...data].sort((a, b) => b.total - a.total)[0]
    const selectedMonth = data[selectedMonthIndex] ?? data[0]

    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border p-4 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Total Acumulado</span>
                    <span className="text-xl font-black tracking-tighter text-foreground">
                        <NumberTicker value={totalProjected} currency isPrivate={isPrivate} />
                    </span>
                </Card>
                <Card className="bg-card border-border p-4 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-all" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Média Mensal</span>
                    <span className="text-xl font-black tracking-tighter text-foreground">
                        <NumberTicker value={averageProjected} currency isPrivate={isPrivate} />
                    </span>
                </Card>
                <Card className="bg-card border-border p-4 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-danger/5 rounded-full blur-xl group-hover:bg-danger/10 transition-all" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Pico (Fatura {maxMonth?.name})</span>
                    <span className="text-xl font-black tracking-tighter text-danger">
                        <NumberTicker value={maxMonth?.total ?? 0} currency isPrivate={isPrivate} />
                    </span>
                </Card>
            </div>

            {/* Gráfico + Detalhe Sincronizado */}
            <Card className="bg-card border-border overflow-hidden">
                <CardHeader className="p-4 sm:p-6 bg-muted/30 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-foreground text-base font-black">
                                <CalendarDays className="h-5 w-5 text-primary" />
                                Projeção de Fluxo de Caixa
                            </CardTitle>
                            <CardDescription className="text-xs font-bold opacity-60 uppercase tracking-widest mt-0.5">
                                Clique em um mês para ver o detalhamento por cartão
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        {/* Gráfico de Barras */}
                        <div className="lg:col-span-3 p-4 sm:p-6">
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                        onClick={(e) => {
                                            const idx = e?.activeTooltipIndex
                                            if (typeof idx === "number") onMonthSelect(idx)
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--border)"
                                            vertical={false}
                                            opacity={0.3}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 900 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            content={<ChartTooltip formatCurrency={formatCurrency} isPrivate={isPrivate} />}
                                            cursor={{ fill: "rgb(var(--theme-primary))", opacity: 0.1 }}
                                        />
                                        <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                                            {data.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill="rgb(var(--theme-primary))"
                                                    // fillOpacity limitado a [0, 1] para evitar valores inválidos (fix B5)
                                                    fillOpacity={index === selectedMonthIndex ? 1 : Math.min(0.3 + index * 0.07, 0.75)}
                                                    stroke={index === selectedMonthIndex ? "rgb(var(--theme-primary))" : "transparent"}
                                                    strokeWidth={index === selectedMonthIndex ? 2 : 0}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Painel de Detalhamento Sincronizado */}
                        <MonthDetailPanel
                            month={selectedMonth}
                            totalProjected={totalProjected}
                            maxMonth={maxMonth}
                            formatCurrency={formatCurrency}
                            isPrivate={isPrivate}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
