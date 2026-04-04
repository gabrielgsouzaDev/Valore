"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { getEconomyBarColor, formatCurrency } from "@/lib/services"
import { cn } from "@/lib/utils"
import Link from "next/link"
import NumberTicker from "@/components/ui/number-ticker"
import type { Subcategory } from "@/lib/types"

interface EconomySidebarProps {
    totalBudgeted: number
    totalSpent: number
    remaining: number
    fixedExpenses: Subcategory[]
    fixedExpensesTotal: number
    isPrivate: boolean
    hasInvestmentsEnabled: boolean
}

export function EconomySidebar({
    totalBudgeted,
    totalSpent,
    remaining,
    fixedExpenses,
    fixedExpensesTotal,
    isPrivate,
    hasInvestmentsEnabled
}: EconomySidebarProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                {/* Overview Card */}
                <Card className="bg-card border-border p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Resumo do Mês</h3>
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Orçado</span>
                                <span className={cn("font-semibold text-foreground text-sm sm:text-base", isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                    {formatCurrency(totalBudgeted)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Gasto</span>
                                <span className={cn("font-semibold text-foreground text-sm sm:text-base", isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                    {formatCurrency(totalSpent)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
                                <span className="text-xs sm:text-sm font-medium text-foreground/80">Restante</span>
                                <p
                                    className="text-lg sm:text-2xl font-bold transition-all duration-300"
                                    style={{
                                        color: remaining >= 0 ? "var(--success)" : "var(--danger)",
                                        filter: isPrivate ? "blur(12px)" : "none",
                                        opacity: isPrivate ? 0.4 : 1,
                                        userSelect: isPrivate ? "none" : "auto",
                                        pointerEvents: isPrivate ? "none" : "auto"
                                    }}
                                >
                                    {formatCurrency(remaining)}
                                </p>
                            </div>
                        </div>

                        <div className="w-full bg-muted rounded-full h-2 sm:h-3 mt-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}%`,
                                    backgroundColor: getEconomyBarColor(totalSpent, totalBudgeted)
                                }}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : "0.0"}% utilizado
                        </p>
                    </div>
                </Card>

                {/* Leftover Rule */}
                {remaining > 0 && hasInvestmentsEnabled && (
                    <Card className="bg-success/5 border-success/20 p-4 sm:p-6 shadow-sm overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all pointer-events-none" />
                        <h3 className="text-xs sm:text-sm font-bold text-success uppercase tracking-widest mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Regra de Sobra
                        </h3>
                        <p className="text-sm text-foreground/80 mb-4 font-medium leading-snug tracking-tight">Você economizou este mês! Que tal investir a diferença para acelerar sua liberdade financeira?</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-success/80 font-bold uppercase mb-1">Aporte Sugerido</p>
                                <div className="text-xl sm:text-2xl font-black text-success tracking-tighter">
                                    <NumberTicker value={remaining} currency isPrivate={isPrivate} />
                                </div>
                            </div>
                            <Link href={`/investimentos?aporte=${remaining}`}>
                                <Button size="sm" className="bg-success hover:bg-success/90 text-white font-bold shadow-md shadow-success/20 rounded-xl">
                                    Investir
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}

                {/* Fixed Expenses */}
                <Card className="bg-card border-border p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Gastos Fixos</h3>
                    <div className="space-y-2 sm:space-y-3">
                        {fixedExpenses.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-foreground/80 truncate mr-2">{sub.name}</span>
                                <span className={cn("font-semibold text-foreground text-sm flex-shrink-0", isPrivate && "blur-sm select-none pointer-events-none opacity-40")}>
                                    {formatCurrency(sub.spent)}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
                            <span className="text-xs sm:text-sm font-medium text-foreground/80">Total</span>
                            <span className={cn("font-bold text-primary text-sm sm:text-base", isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                {formatCurrency(fixedExpensesTotal)}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
