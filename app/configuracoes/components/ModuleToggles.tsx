"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Zap, TrendingUp, PiggyBank, Target, Receipt, CreditCard } from "lucide-react"

interface ModuleTogglesProps {
    activeModules: Record<string, boolean>
    onToggleModule: (id: string, val: boolean) => void
}

const modules = [
    { id: "investimentos", name: "Investimentos", icon: <TrendingUp className="h-4 w-4" />, description: "Gestão de ativos, aportes e rentabilidade." },
    { id: "economia", name: "Economia", icon: <PiggyBank className="h-4 w-4" />, description: "Regras de sobra e análise de poupança." },
    { id: "objetivos", name: "Objetivos", icon: <Target className="h-4 w-4" />, description: "Metas financeiras e sonhos de longo prazo." },
    { id: "transacoes", name: "Transações", icon: <Receipt className="h-4 w-4" />, description: "Fluxo de caixa diário e agendamentos.", disabled: true },
    { id: "cartoes", name: "Cartões", icon: <CreditCard className="h-4 w-4" />, description: "Gestão de faturas e limites de crédito." },
]

export function ModuleToggles({
    activeModules,
    onToggleModule
}: ModuleTogglesProps) {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Módulos Ativos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Personalize sua experiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3">
                    {modules.map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {mod.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground">{mod.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{mod.id}</span>
                                </div>
                            </div>
                            <Switch
                                checked={activeModules[mod.id]}
                                onCheckedChange={(val) => onToggleModule(mod.id, val)}
                                disabled={mod.disabled}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic px-2">
                    * Módulos desativados não serão removidos do seu banco de dados, apenas ocultos da interface.
                </p>
            </CardContent>
        </Card>
    )
}
