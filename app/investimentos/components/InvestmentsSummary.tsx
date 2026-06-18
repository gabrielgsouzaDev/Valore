"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import NumberTicker from "@/components/ui/number-ticker"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/services"

/**
 * Props para o componente de sumário de investimentos.
 */
interface InvestmentsSummaryProps {
    /** Valor total do patrimônio líquido. */
    totalNetWorth: number
    /** Valor total investido em ativos. */
    totalInvested: number
    /** Ganho ou perda total em reais. */
    totalGain: number
    /** Rentabilidade percentual total. */
    profitability: number
    /** Total de dívidas em faturas de cartão. */
    cardDebt: number
    /** Indica se os valores sensíveis devem ser ocultados. */
    isPrivate: boolean
    /** Indica se os dados estão sendo carregados do IndexedDB. */
    isLoading?: boolean
}

/**
 * Exibe os principais indicadores financeiros do investidor.
 * Inclui patrimônio, total investido e dívidas de curto prazo.
 */
export function InvestmentsSummary({
    totalNetWorth,
    totalInvested,
    totalGain,
    profitability,
    cardDebt,
    isPrivate,
    isLoading
}: InvestmentsSummaryProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} variant="summary" className="h-[120px] sm:h-[140px]" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <Card className="bg-card border-border p-4 sm:p-6 shadow-sm group hover:border-primary/30 transition-all">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Patrimônio Atual</p>
                <div className="text-2xl sm:text-3xl font-black truncate text-primary tracking-tighter">
                    <NumberTicker value={totalNetWorth} currency isPrivate={isPrivate} />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="outline" className={cn(
                        "text-[10px] py-0 px-1.5 font-bold border-none",
                        totalGain >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                        {profitability >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                        <span className={cn(isPrivate && "blur-sm select-none")}>
                            {profitability.toFixed(1)}% ({totalGain >= 0 ? "+" : ""}{formatCurrency(totalGain)})
                        </span>
                    </Badge>
                </div>
            </Card>

            <Card className="bg-card border-border p-4 sm:p-6 shadow-sm">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Investido</p>
                <div className="text-2xl sm:text-3xl font-black truncate text-foreground tracking-tighter">
                    <NumberTicker value={totalInvested} currency isPrivate={isPrivate} />
                </div>
            </Card>

            <Card className="bg-card border-border p-4 sm:p-6 shadow-sm">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Dívidas (Cartões)</p>
                <div className="text-2xl sm:text-3xl font-black truncate text-danger tracking-tighter">
                    <NumberTicker value={cardDebt} currency isPrivate={isPrivate} />
                </div>
            </Card>
        </div>
    )
}
