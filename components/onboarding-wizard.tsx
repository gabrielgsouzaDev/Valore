"use client"

import { useState } from "react"
import { useApp, applyThemeVariables } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Activity, Palette, ArrowRight, Loader2, Rocket, Receipt, Wallet, TrendingUp, Target, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { themePresets } from "@/lib/constants"
import type { ThemePreset } from "@/lib/types"

const modulesInfo = [
    { id: "economia", name: "Economia & Orçamento", icon: Wallet, desc: "Controle de despesas, metas de gastos" },
    { id: "investimentos", name: "Investimentos", icon: TrendingUp, desc: "Ações, FIIs, Cripto e Renda Fixa" },
    { id: "transacoes", name: "Transações", icon: Receipt, desc: "Fluxo de caixa diário (receitas/despesas)" },
    { id: "cartoes", name: "Cartões de Crédito", icon: CreditCard, desc: "Gestão de limites e faturas" },
    { id: "objetivos", name: "Objetivos de Vida", icon: Target, desc: "Reserva de emergência e metas longas" },
]

export function OnboardingWizard() {
    const { updateSettings } = useApp()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [nome, setNome] = useState("")
    const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
        economia: true, investimentos: true, transacoes: true, cartoes: true, objetivos: true
    })
    const [themeId, setThemeId] = useState("paper")

    const handleSkip = () => {
        setIsSubmitting(true)
        updateSettings({
            nome: "Usuário",
            onboardingCompleted: true,
            activeModules: { economia: true, investimentos: true, transacoes: true, cartoes: true, objetivos: true }
        })
        const paperTheme = themePresets.find(t => t.id === "paper")
        if (paperTheme) applyThemeVariables(paperTheme)
        setTimeout(() => router.push("/"), 500)
    }

    const completeOnboarding = async () => {
        setIsSubmitting(true)
        // Simulate a small loading to feel premium
        await new Promise(r => setTimeout(r, 600))
        updateSettings({
            nome: nome.trim() || "Usuário",
            activeModules,
            themeId,
            onboardingCompleted: true,
        })

        // Find which module is active to redirect
        const firstActive = Object.keys(activeModules).find(k => activeModules[k])
        if (firstActive === "investimentos") router.push("/investimentos")
        else if (firstActive === "economia") router.push("/economia")
        else router.push("/")
    }

    const handleThemeSelect = (theme: ThemePreset) => {
        setThemeId(theme.id)
        applyThemeVariables(theme) // Instant preview
    }

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Como podemos chamar você?</h1>
                            <p className="text-sm text-muted-foreground">Isso personalizará sua experiência.</p>
                        </div>
                        <div className="space-y-4 pt-2">
                            <Input
                                placeholder="Seu nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="h-12 text-lg text-center font-medium bg-muted/30 focus-visible:ring-primary rounded-xl"
                                autoFocus
                            />
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!nome.trim()}
                                    className="w-full h-12 text-base font-bold rounded-xl"
                                >
                                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground w-full">
                                    Pular configuração
                                </Button>
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Activity className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight">O que você vai usar?</h2>
                            <p className="text-sm text-muted-foreground">Ative apenas o que faz sentido para você.</p>
                        </div>
                        <div className="space-y-3 pt-2 max-h-[40vh] overflow-y-auto pr-2">
                            {modulesInfo.map((mod) => (
                                <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <mod.icon className="h-4 w-4 text-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{mod.name}</p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">{mod.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={activeModules[mod.id] || false}
                                        onCheckedChange={(checked) => setActiveModules(prev => ({ ...prev, [mod.id]: checked }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">Voltar</Button>
                            <Button onClick={() => setStep(3)} className="flex-1 rounded-xl">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Palette className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Sua identidade</h2>
                            <p className="text-sm text-muted-foreground">Escolha o tema que mais te agrada.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-2 pt-2">
                            {themePresets.map((theme) => {
                                const isSelected = themeId === theme.id
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme)}
                                        className={cn(
                                            "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                                            isSelected ? "border-primary bg-primary/5 scale-[1.02]" : "border-border/50 hover:border-primary/50 bg-card"
                                        )}
                                    >
                                        <div
                                            className="w-full h-12 rounded-lg mb-2 border border-border/30 overflow-hidden flex flex-col"
                                            style={{ background: `rgb(${theme.colors.background})` }}
                                        >
                                            <div className="h-3 w-full" style={{ background: `rgb(${theme.colors.card})` }} />
                                            <div className="flex-1 flex items-center justify-center px-2">
                                                <div className="h-2 w-full rounded-full" style={{ background: `rgb(${theme.colors.primary})` }} />
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold truncate w-full text-foreground">{theme.name}</p>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting} className="flex-1 rounded-xl">Voltar</Button>
                            <Button onClick={completeOnboarding} disabled={isSubmitting} className="flex-1 rounded-xl bg-primary text-primary-foreground">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="mr-2 h-4 w-4" /> Concluir</>}
                            </Button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4">
            <Card className="w-full max-w-sm p-6 sm:p-8 shadow-2xl border-border bg-card/90 backdrop-blur-md relative overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 left-0 h-1.5 bg-muted w-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500 ease-out bg-primary"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
                {renderContent()}
            </Card>
        </div>
    )
}
