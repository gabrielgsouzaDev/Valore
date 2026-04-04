"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Plus } from "lucide-react"

interface InvestmentsHeaderProps {
    onAddAsset: () => void
}

export function InvestmentsHeader({ onAddAsset }: InvestmentsHeaderProps) {
    return (
        <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
            <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    <div>
                        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Investimentos</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onAddAsset}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-md shadow-primary/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Novo Ativo
                    </Button>
                </div>
            </div>
        </header>
    )
}
