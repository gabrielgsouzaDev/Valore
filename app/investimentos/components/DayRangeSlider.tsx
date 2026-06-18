"use client"

import { formatCurrency } from "@/lib/services"
import { cn } from "@/lib/utils"

interface DayRangeSliderProps {
    min: number
    max: number
    current: number
    isPrivate?: boolean
}

export function DayRangeSlider({ min, max, current, isPrivate = false }: DayRangeSliderProps) {
    // Calcular a porcentagem da posição do preço atual no range do dia
    const range = max - min
    const position = range > 0 ? ((current - min) / range) * 100 : 50
    const clampedPosition = Math.min(Math.max(position, 0), 100)

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left">Variação do Dia</h4>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Preço Atual</p>
                    <p className={cn("text-xs font-black text-primary", isPrivate && "blur-sm select-none")}>{formatCurrency(current)}</p>
                </div>
            </div>

            <div className="relative pt-2 pb-1">
                {/* Track */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-danger/20 flex-1" />
                    <div className="h-full bg-success/20 flex-1" />
                </div>

                {/* Marker */}
                <div
                    className="absolute top-0 w-1 h-5 bg-primary rounded-full shadow-lg shadow-primary/20 transition-all duration-500 ease-out"
                    style={{ left: `${clampedPosition}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute -top-1 left-1/2 -translateX-1/2 w-2 h-2 bg-primary rounded-full" />
                </div>
            </div>

            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <div className="space-y-0.5">
                    <p>Mínima</p>
                    <p className={cn("text-foreground", isPrivate && "blur-sm select-none")}>{formatCurrency(min)}</p>
                </div>
                <div className="space-y-0.5 text-right">
                    <p>Máxima</p>
                    <p className={cn("text-foreground", isPrivate && "blur-sm select-none")}>{formatCurrency(max)}</p>
                </div>
            </div>
        </div>
    )
}
