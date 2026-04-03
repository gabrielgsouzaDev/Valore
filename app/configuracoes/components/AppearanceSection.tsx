"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Palette, Check, Sparkles, Zap, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { themePresets } from "@/lib/constants"
import type { ThemePreset } from "@/lib/types"

interface AppearanceSectionProps {
    currentTheme: ThemePreset
    setTheme: (theme: string) => void
    userFocus: string
    onFocusChange: (focus: string) => void
}

export function AppearanceSection({
    currentTheme,
    setTheme,
    userFocus,
    onFocusChange
}: AppearanceSectionProps) {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                    Aparência e Temas
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Personalize o visual do seu Valore</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3">
                    <Label className="text-foreground/80 text-xs sm:text-sm">Tema Ativo</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {themePresets.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setTheme(theme.id)}
                                className={cn(
                                    "relative flex flex-col items-start p-3 rounded-xl border-2 transition-all group overflow-hidden h-24",
                                    currentTheme.id === theme.id
                                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                                )}
                            >
                                <div className="flex items-center justify-between w-full mb-auto">
                                    <div className="flex -space-x-1.5 shrink-0">
                                        <div className="w-4 h-4 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: `rgb(${theme.colors.primary})` }} title="Primary" />
                                        <div className="w-4 h-4 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: `rgb(${theme.colors.accent})` }} title="Accent" />
                                        <div className="w-4 h-4 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: `rgb(${theme.colors.background})` }} title="Background" />
                                    </div>
                                    {currentTheme.id === theme.id && (
                                        <div className="bg-primary text-primary-foreground rounded-full p-0.5 animate-in zoom-in-50 duration-300">
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-left">
                                    <p className="text-xs font-bold text-foreground leading-none">{theme.name}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                                        {theme.id}
                                    </p>
                                </div>
                                {theme.mode === "dark" && (
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-black/10 rounded-bl-full flex items-center justify-end pr-1 pt-1 pointer-events-none">
                                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                    <Label className="text-foreground/80 text-xs sm:text-sm">Foco da Interface</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                            variant={userFocus === "finance" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFocusChange("finance")}
                            className="justify-start text-xs h-auto py-2.5 px-3"
                        >
                            <Zap className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <div className="text-left">
                                <p className="font-bold">Finanças</p>
                                <p className="text-[9px] opacity-70">Prioriza fluxo de caixa</p>
                            </div>
                        </Button>
                        <Button
                            variant={userFocus === "investing" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFocusChange("investing")}
                            className="justify-start text-xs h-auto py-2.5 px-3"
                        >
                            <TrendingUp className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <div className="text-left">
                                <p className="font-bold">Investimentos</p>
                                <p className="text-[9px] opacity-70">Foco em patrimônio</p>
                            </div>
                        </Button>
                        <Button
                            variant={userFocus === "both" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFocusChange("both")}
                            className="justify-start text-xs h-auto py-2.5 px-3"
                        >
                            <Sparkles className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <div className="text-left">
                                <p className="font-bold">Híbrido</p>
                                <p className="text-[9px] opacity-70">Equilíbrio total</p>
                            </div>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
