"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/services"
import Link from "next/link"
import type { Goal } from "@/lib/types"

interface GoalSidebarProps {
    totals: {
        target: number
        current: number
        monthly: number
        remaining: number
    }
    goals: Goal[]
    availableForInvestment: number
    isPrivate: boolean
}

export function GoalSidebar({ totals, goals, availableForInvestment, isPrivate }: GoalSidebarProps) {
    const reachedPercentage = totals.target > 0 ? (totals.current / totals.target) * 100 : 0

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                {/* Available for Investment */}
                <Card className="bg-success/5 border-success/20 p-4 sm:p-6 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all pointer-events-none" />
                    <h3 className="text-xs sm:text-sm font-bold text-success uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Disponível p/ Investir
                    </h3>
                    <p className="text-sm text-foreground/80 mb-4 font-medium leading-snug tracking-tight">Que tal aportar este valor hoje para acelerar seus objetivos?</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[10px] text-success/80 font-bold uppercase mb-1">Saldo em Investimentos</p>
                            <div className="text-xl sm:text-2xl font-black text-success tracking-tighter">
                                {formatCurrency(Math.max(0, availableForInvestment))}
                            </div>
                        </div>
                        <Link href={`/investimentos?aporte=${availableForInvestment}`}>
                            <Button size="sm" className="bg-success hover:bg-success/90 text-white font-bold shadow-md shadow-success/20 rounded-xl px-4">
                                Investir
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Overview Card */}
                <Card className="bg-card border-border p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Visão Geral</h3>
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Acumulado</p>
                            <p className="text-lg sm:text-2xl font-bold" style={{ color: "var(--success)" }}>
                                {formatCurrency(totals.current)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Meta Total</p>
                            <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(totals.target)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Falta Acumular</p>
                            <p className="text-lg sm:text-2xl font-bold text-accent">
                                {formatCurrency(totals.remaining)}
                            </p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${reachedPercentage}%`,
                                    backgroundColor: "var(--success)"
                                }}
                            />
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                            {reachedPercentage.toFixed(1)}% alcançado
                        </p>
                    </div>
                </Card>

                {/* Monthly Contribution */}
                <Card className="bg-card border-border p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-4">
                        Aportes Mensais
                    </h3>
                    <p className="text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                        {formatCurrency(totals.monthly)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total destinado mensalmente</p>
                </Card>

                {/* Priority Distribution */}
                <Card className="bg-card border-border p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
                        Prioridades
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        {["alta", "média", "baixa"].map((priority) => {
                            const count = goals.filter((g) => g.priority === priority).length
                            const colors = { alta: "var(--danger)", média: "var(--warning)", baixa: "var(--success)" }
                            return (
                                <div key={priority} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: colors[priority as keyof typeof colors] }}></div>
                                        <span className="text-xs sm:text-sm text-foreground/80 capitalize">{priority}</span>
                                    </div>
                                    <span className="font-semibold text-foreground text-sm">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    )
}
