"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, TrendingUp, Sparkles, ArrowRight, User, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function OnboardingWizard() {
    const { settings, updateSettings } = useApp()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [name, setName] = useState("")
    const [focus, setFocus] = useState<"finances" | "investments" | "both" | null>(null)
    const [isFinishing, setIsFinishing] = useState(false)

    const handleNext = () => setStep((prev) => prev + 1)

    const completeOnboarding = () => {
        setIsFinishing(true)
        setTimeout(() => {
            updateSettings({
                nome: name.trim(),
                userFocus: focus || "both",
                onboardingCompleted: true,
                showGuide: true,
                activeGuideStep: 0,
            })

            if (focus === "finances") {
                router.push("/app/economia")
            }
        }, 1500)
    }

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-center">
                            <div className="bg-primary/10 p-4 sm:p-5 rounded-3xl ring-8 ring-primary/5">
                                <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Boas-vindas ao Valore</h1>
                            <p className="text-muted-foreground text-base sm:text-lg">Para começarmos a sua jornada personalizada, como devemos chamar você?</p>
                        </div>
                        <div className="space-y-4 sm:space-y-5 pt-2 sm:pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">Seu Primeiro Nome</Label>
                                <Input
                                    id="name"
                                    placeholder=""
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-muted/30 h-12 sm:h-14 text-lg sm:text-xl font-medium focus-visible:ring-primary border-2 border-border/50 focus:border-primary transition-all rounded-2xl"
                                    autoFocus
                                />
                            </div>
                            <Button
                                onClick={handleNext}
                                disabled={!name.trim()}
                                className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold rounded-2xl group shadow-lg shadow-primary/20"
                            >
                                Continuar
                                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Qual o seu foco agora?</h2>
                            <p className="text-muted-foreground text-base sm:text-lg">Não se preocupe, o Valore é completo e você terá acesso a tudo.</p>
                        </div>
                        <div className="grid gap-3 sm:gap-4 pt-2 sm:pt-4">
                            <button
                                onClick={() => { setFocus("finances"); handleNext(); }}
                                className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl border-2 border-border/50 hover:border-primary bg-card hover:bg-primary/5 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="bg-orange-500/10 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                                    <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-base sm:text-lg">Gastos e Dívidas</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Foco em cartões, bancos e fluxo de caixa.</p>
                                </div>
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                            </button>

                            <button
                                onClick={() => { setFocus("investments"); handleNext(); }}
                                className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl border-2 border-border/50 hover:border-primary bg-card hover:bg-primary/5 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="bg-emerald-500/10 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-base sm:text-lg">Multiplicar Patrimônio</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Foco em ativos e estratégias de investimento.</p>
                                </div>
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                            </button>

                            <button
                                onClick={() => { setFocus("both"); handleNext(); }}
                                className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl border-2 border-border/50 hover:border-primary bg-card hover:bg-primary/5 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="bg-primary/10 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-base sm:text-lg">Controle Total</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Tudo o que o Valore oferece para você.</p>
                                </div>
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                            </button>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-center">
                            <div className="bg-primary/10 p-5 sm:p-6 rounded-full relative">
                                <Rocket className="h-12 w-12 sm:h-14 sm:w-14 text-primary animate-bounce" />
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping -z-10" />
                            </div>
                        </div>
                        <div className="text-center space-y-2 sm:space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                                Decolagem autorizada, {name}!
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                Configuramos seu painel com foco em
                                <span className="text-primary font-bold"> {focus === "finances" ? "Gestão Financeira" : focus === "investments" ? "Investimentos" : "Gestão 360°"}</span>.
                            </p>
                        </div>

                        <div className="bg-muted/20 p-4 sm:p-6 rounded-2xl border border-border/50 space-y-2 text-center">
                            <p className="text-xs sm:text-sm font-medium text-foreground">
                                O Valore agora conta com um <span className="text-primary font-bold">Guia Interativo</span> que aparecerá no canto da tela para te ajudar nos primeiros passos.
                            </p>
                        </div>

                        <Button
                            onClick={completeOnboarding}
                            disabled={isFinishing}
                            className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold rounded-2xl shadow-xl shadow-primary/20"
                        >
                            {isFinishing ? "Preparando Mission Control..." : "Entrar no Dashboard"}
                        </Button>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
            </div>

            <Card className="w-full max-w-xl p-6 sm:p-12 shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)] border-primary/20 bg-card/80 backdrop-blur-sm relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 h-2 bg-muted/30 w-full">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {renderContent()}

                <div className="mt-10 flex justify-center">
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    i === step ? "w-10 bg-primary" : i < step ? "w-4 bg-primary/30" : "w-4 bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}
