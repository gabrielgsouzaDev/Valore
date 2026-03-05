"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    CheckCircle2,
    Circle,
    ArrowRight,
    X,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Target,
    Settings as SettingsIcon,
    Wallet,
    TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function OnboardingCopilot() {
    const { settings, updateSettings, banks, creditCards, assets, goals } = useApp()
    const [isMinimized, setIsMinimized] = useState(false)

    if (!settings.onboardingCompleted || !settings.showGuide) return null

    const missions = [
        {
            title: "Moradia da Renda",
            description: "Defina sua renda mensal para o Valore calcular seu potencial.",
            icon: SettingsIcon,
            link: "/configuracoes",
            isDone: settings.rendaMensal > 0,
            cta: "Ir para Configurações"
        },
        {
            title: "Fluxo de Energia",
            description: "Cadastre seu primeiro banco ou cartão para monitorar o saldo.",
            icon: Wallet,
            link: "/configuracoes",
            isDone: banks.length > 0 || creditCards.length > 0,
            cta: "Vincular Banco"
        },
        {
            title: settings.userFocus === "finances" ? "Primeiro Passo" : "Sementes do Futuro",
            description: settings.userFocus === "finances"
                ? "Crie seu primeiro objetivo financeiro (ex: Reserva)."
                : "Adicione seu primeiro ativo (Ação, Fundo ou FII).",
            icon: settings.userFocus === "finances" ? Target : TrendingUp,
            link: settings.userFocus === "finances" ? "/objetivos" : "/",
            isDone: settings.userFocus === "finances" ? goals.length > 0 : assets.length > 0,
            cta: settings.userFocus === "finances" ? "Criar Objetivo" : "Adicionar Ativo"
        },
        {
            title: "Identidade Visual",
            description: "Explore os 19 temas e escolha o que melhor combina com você.",
            icon: Sparkles,
            link: "/configuracoes",
            isDone: settings.themeId !== "midnight" && settings.themeId !== "golden-hour", // Se mudou do padrão
            cta: "Mudar Tema"
        }
    ]

    const activeIndex = settings.activeGuideStep ?? 0
    const currentMission = missions[activeIndex]
    const progress = (missions.filter(m => m.isDone).length / missions.length) * 100
    const allDone = missions.every(m => m.isDone)

    const handleNext = () => {
        if (activeIndex < missions.length - 1) {
            updateSettings({ activeGuideStep: activeIndex + 1 })
        }
    }

    const handlePrev = () => {
        if (activeIndex > 0) {
            updateSettings({ activeGuideStep: activeIndex - 1 })
        }
    }

    const closeGuide = () => {
        updateSettings({ showGuide: false })
    }

    if (allDone) {
        return (
            <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-10 duration-700">
                <Card className="p-4 bg-primary text-primary-foreground border-none shadow-2xl flex items-center gap-4 rounded-2xl">
                    <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold">Missão Cumprida!</p>
                        <p className="text-xs opacity-90">Você concluiu o guia básico do Valore.</p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={closeGuide}
                        className="hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-[60] transition-all duration-500 ease-in-out",
            isMinimized ? "w-14 h-14" : "w-full max-w-sm"
        )}>
            {isMinimized ? (
                <Button
                    onClick={() => setIsMinimized(false)}
                    className="w-14 h-14 rounded-full shadow-2xl p-0 flex items-center justify-center animate-bounce hover:animate-none"
                    aria-label="Abrir Guia"
                >
                    <Sparkles className="h-6 w-6" />
                </Button>
            ) : (
                <Card className="overflow-hidden border-primary/20 shadow-[0_20px_50px_-12px_rgba(var(--primary),0.3)] bg-card/95 backdrop-blur-md rounded-[2rem]">
                    <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 fill-current" />
                            <span className="font-bold text-sm tracking-tight">MISSION CONTROL</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-white/10 rounded-full"
                                onClick={() => setIsMinimized(true)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {missions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            i === activeIndex ? "w-6 bg-primary" : missions[i].isDone ? "w-2 bg-emerald-500" : "w-2 bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Passo {activeIndex + 1} de {missions.length}
                            </span>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className={cn(
                                "p-3 rounded-2xl flex-shrink-0",
                                currentMission.isDone ? "bg-emerald-500/10" : "bg-primary/10"
                            )}>
                                <currentMission.icon className={cn(
                                    "h-6 w-6",
                                    currentMission.isDone ? "text-emerald-500" : "text-primary"
                                )} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                    {currentMission.title}
                                    {currentMission.isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {currentMission.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Link href={currentMission.link} className="flex-1">
                                <Button className="w-full rounded-xl font-bold gap-2 group">
                                    {currentMission.cta}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl border-border hover:bg-muted"
                                    onClick={handlePrev}
                                    disabled={activeIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl border-border hover:bg-muted"
                                    onClick={handleNext}
                                    disabled={activeIndex === missions.length - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            )}
        </div>
    )
}
