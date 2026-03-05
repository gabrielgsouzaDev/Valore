"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, TrendingUp, Sparkles, CheckCircle2, ArrowRight, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function OnboardingWizard() {
    const { settings, updateSettings, addAsset, addCategory } = useApp()
    const [step, setStep] = useState(1)
    const [name, setName] = useState(settings.nome === "Valore" ? "" : settings.nome)
    const [focus, setFocus] = useState<"finances" | "investments" | "both" | null>(null)
    const [isFinishing, setIsFinishing] = useState(false)

    const handleNext = () => setStep((prev) => prev + 1)

    const completeOnboarding = () => {
        setIsFinishing(true)
        // Pequeno delay para efeito visual de "processando"
        setTimeout(() => {
            updateSettings({
                nome: name || settings.nome,
                userFocus: focus || "both",
                onboardingCompleted: true
            })
        }, 1000)
    }

    // Renderiza o conteúdo baseado no passo
    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-center mb-6">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo ao Valore</h1>
                            <p className="text-muted-foreground">Vamos começar com o básico. Como podemos te chamar?</p>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Seu Nome</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Gabriel"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-muted/50 h-12 text-lg focus-visible:ring-primary"
                                    autoFocus
                                />
                            </div>
                            <Button
                                onClick={handleNext}
                                disabled={!name.trim()}
                                className="w-full h-12 text-lg font-semibold group"
                            >
                                Continuar
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Qual o seu foco principal agora?</h2>
                            <p className="text-muted-foreground">Personalizaremos sua experiência com base na sua resposta.</p>
                        </div>
                        <div className="grid gap-4 pt-4">
                            <button
                                onClick={() => { setFocus("finances"); handleNext(); }}
                                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary bg-card/50 hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="bg-orange-500/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                    <Wallet className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Organizar meus gastos e dívidas</h3>
                                    <p className="text-sm text-muted-foreground">Foco em orçamento, cartões e fluxo de caixa.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setFocus("investments"); handleNext(); }}
                                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary bg-card/50 hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="bg-emerald-500/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Acompanhar meus investimentos</h3>
                                    <p className="text-sm text-muted-foreground">Foco em alocação, rebalanceamento e estratégias.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setFocus("both"); handleNext(); }}
                                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary bg-card/50 hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="bg-primary/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Os dois</h3>
                                    <p className="text-sm text-muted-foreground">Acesso completo a todas as ferramentas do Valore.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">
                                Tudo pronto, {name.split(" ")[0]}!
                            </h2>
                            <p className="text-muted-foreground">
                                Configuramos o Valore para priorizar suas necessidades de
                                {focus === "finances" ? " gestão financeira" : focus === "investments" ? " investimentos" : " controle total"}.
                            </p>
                        </div>

                        <div className="bg-muted/30 p-6 rounded-2xl border border-border space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primeiras tarefas sugeridas:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-foreground">Definir sua Renda Mensal fixa</span>
                                </li>
                                {focus !== "investments" && (
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        <span className="text-foreground">Cadastrar seus Cartões de Crédito</span>
                                    </li>
                                )}
                                {focus !== "finances" && (
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        <span className="text-foreground">Adicionar seu primeiro ativo de carteira</span>
                                    </li>
                                )}
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-foreground">Ajustar o Tema (19 opções disponíveis!)</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            onClick={completeOnboarding}
                            disabled={isFinishing}
                            className="w-full h-12 text-lg font-semibold"
                        >
                            {isFinishing ? "Preparando Dashboard..." : "Começar a Usar"}
                        </Button>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg p-8 shadow-2xl border-primary/20 bg-card relative overflow-hidden">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 h-1.5 bg-muted w-full">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {renderContent()}

                <div className="mt-8 flex justify-center">
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 w-8 rounded-full transition-all duration-300",
                                    i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}
