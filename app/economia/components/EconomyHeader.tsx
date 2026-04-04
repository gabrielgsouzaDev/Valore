"use client"

import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"

interface EconomyHeaderProps {
    remaining: number
    isPrivate: boolean
}

export function EconomyHeader({ remaining, isPrivate }: EconomyHeaderProps) {
    return (
        <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
            <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    <div className="flex flex-col justify-center">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Economia</h2>
                    </div>
                </div>
                <div className="text-left sm:text-right flex flex-col justify-center">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Saldo Restante</p>
                    <div className={cn("text-xl sm:text-3xl font-bold tracking-tight",
                        remaining >= 0 ? "text-success" : "text-danger"
                    )}>
                        <NumberTicker value={remaining} currency isPrivate={isPrivate} />
                    </div>
                </div>
            </div>
        </header>
    )
}
