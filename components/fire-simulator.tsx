"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Flame, Calendar, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/services"

interface FireSimulatorProps {
    currentEquity: number
    monthlyContribution: number
}

export function FireSimulator({ currentEquity, monthlyContribution }: FireSimulatorProps) {
    const [monthlyExpense, setMonthlyExpense] = useState(5000)
    const [annualReturn, setAnnualReturn] = useState(8)
    const [inflation, setInflation] = useState(4)

    const realReturn = (1 + annualReturn / 100) / (1 + inflation / 100) - 1
    const monthlyRealReturn = Math.pow(1 + realReturn, 1 / 12) - 1

    // Regra dos 4% (ou 25x o gasto anual)
    const targetEquity = monthlyExpense * 12 * 25

    const calculateYears = () => {
        if (monthlyRealReturn <= 0) return Infinity
        if (currentEquity >= targetEquity) return 0

        // Formula: FV = PV(1+r)^n + PMT[((1+r)^n - 1) / r]
        // Resolvendo para n (meses):
        // n = log((target*r + PMT) / (equity*r + PMT)) / log(1+r)

        const numerator = (targetEquity * monthlyRealReturn + monthlyContribution)
        const denominator = (currentEquity * monthlyRealReturn + monthlyContribution)

        const months = Math.log(numerator / denominator) / Math.log(1 + monthlyRealReturn)
        return Math.max(0, months / 12)
    }

    const yearsToFire = calculateYears()

    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Flame className="h-5 w-5 fill-primary" />
                    Simulador FIRE
                </CardTitle>
                <CardDescription>Independência Financeira</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Gasto Mensal Desejado</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="number"
                                value={monthlyExpense}
                                onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                                className="pl-8 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Retorno Real Est. (aa)</Label>
                        <div className="relative">
                            <TrendingUp className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="number"
                                value={annualReturn - inflation}
                                readOnly
                                className="pl-8 h-9 text-sm bg-muted/30"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">Patrimônio Alvo (25x)</p>
                    <p className="text-2xl font-black text-foreground tracking-tighter">{formatCurrency(targetEquity)}</p>

                    <div className="h-px bg-border/50 my-3" />

                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">Tempo Estimado</p>
                    <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-3xl font-black text-primary tracking-tighter">
                            {yearsToFire === Infinity ? "∞" : yearsToFire === 0 ? "LIBERDADE!" : `${yearsToFire.toFixed(1)} anos`}
                        </span>
                    </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center italic">
                    *Estimativa baseada na rentabilidade real e aportes constantes.
                </p>
            </CardContent>
        </Card>
    )
}
