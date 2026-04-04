"use client"

import { Target } from "lucide-react"
import { formatCurrency } from "@/lib/services"

interface GoalHeaderProps {
    totalCurrent: number
    totalTarget: number
}

export function GoalHeader({ totalCurrent, totalTarget }: GoalHeaderProps) {
    const percentage = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : "0"

    return (
        <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
            <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    <div className="flex flex-col justify-center">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Objetivos</h2>
                    </div>
                </div>
                <div className="text-left sm:text-right flex flex-col justify-center">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Acumulado vs Meta</p>
                    <div className="flex flex-col sm:items-end">
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-success">
                            {formatCurrency(totalCurrent)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            de {formatCurrency(totalTarget)} ({percentage}%)
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}
