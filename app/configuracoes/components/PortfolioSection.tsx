"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, Save, CheckCircle, Loader2 } from "lucide-react"

interface PortfolioSectionProps {
    totalNetWorth: number
    metaReservaEmergencia: string
    investmentStrategy: string
    onChange: (field: string, value: string) => void
    onSave: () => void
    isSubmitting: boolean
    saveStatus: string | null
    formatCurrency: (val: number) => string
}

export function PortfolioSection({
    totalNetWorth,
    metaReservaEmergencia,
    investmentStrategy,
    onChange,
    onSave,
    isSubmitting,
    saveStatus,
    formatCurrency
}: PortfolioSectionProps) {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    Portfolio
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Configurações gerais de investimentos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="reserva" className="text-foreground/80 text-xs sm:text-sm">
                        Meta Reserva de Emergencia (meses)
                    </Label>
                    <Input
                        id="reserva"
                        type="number"
                        value={metaReservaEmergencia}
                        onChange={(e) => onChange("metaReservaEmergencia", e.target.value)}
                        className="bg-muted border-border text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Recomendado: 6 meses</p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-foreground/80 text-xs sm:text-sm">Estratégia de Investimento</Label>
                    <div className="grid grid-cols-1 gap-2">
                        <Button
                            variant={investmentStrategy === "rebalance" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onChange("investmentStrategy", "rebalance")}
                            className="justify-start text-xs sm:text-sm h-auto py-2 px-3"
                        >
                            <div className="text-left">
                                <p className="font-bold">Rebalanceamento Inteligente</p>
                                <p className="text-[10px] opacity-70">Aporta onde está mais longe da meta</p>
                            </div>
                        </Button>
                        <Button
                            variant={investmentStrategy === "proportional" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onChange("investmentStrategy", "proportional")}
                            className="justify-start text-xs sm:text-sm h-auto py-2 px-3"
                        >
                            <div className="text-left">
                                <p className="font-bold">Distribuição Proporcional</p>
                                <p className="text-[10px] opacity-70">Divide estritamente pelas metas (%)</p>
                            </div>
                        </Button>
                        <Button
                            variant={investmentStrategy === "waterfall" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onChange("investmentStrategy", "waterfall")}
                            className="justify-start text-xs sm:text-sm h-auto py-2 px-3"
                        >
                            <div className="text-left">
                                <p className="font-bold">Cascata (Waterfall)</p>
                                <p className="text-[10px] opacity-70">Preenche metas 100% por prioridade</p>
                            </div>
                        </Button>
                    </div>
                </div>

                <Button
                    onClick={onSave}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm min-w-[120px]"
                >
                    {isSubmitting && saveStatus === "portfolio" ? (
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    ) : saveStatus === "portfolio" ? (
                        <>
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Salvo!
                        </>
                    ) : (
                        <>
                            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Salvar Portfolio
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
