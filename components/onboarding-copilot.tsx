"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    CheckCircle2,
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
    const [isVisible, setIsVisible] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    // Anima a entrada ao montar
    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 100)
        return () => clearTimeout(t)
    }, [])

    if (!settings.onboardingCompleted || !settings.showGuide) return null

    const missions = [
        {
            title: "Renda Mensal",
            description: "Defina sua renda mensal para o Valore calcular seu potencial.",
            icon: SettingsIcon,
            link: "/app/configuracoes",
            isDone: settings.rendaMensal > 0,
            cta: "Configurar Renda"
        },
        {
            title: "Fluxo de Energia",
            description: "Cadastre seu primeiro banco ou cartão para monitorar o saldo.",
            icon: Wallet,
            link: "/app/configuracoes",
            isDone: banks.length > 0 || creditCards.length > 0,
            cta: "Vincular Banco"
        },
        {
            title: settings.userFocus === "finances" ? "Primeiro Objetivo" : "Sementes do Futuro",
            description: settings.userFocus === "finances"
                ? "Crie seu primeiro objetivo financeiro (ex: Reserva de Emergência)."
                : "Adicione seu primeiro ativo (Ação, Fundo ou FII).",
            icon: settings.userFocus === "finances" ? Target : TrendingUp,
            link: settings.userFocus === "finances" ? "/app/objetivos" : "/app",
            isDone: settings.userFocus === "finances" ? goals.length > 0 : assets.length > 0,
            cta: settings.userFocus === "finances" ? "Criar Objetivo" : "Adicionar Ativo"
        },
        {
            title: "Identidade Visual",
            description: "Explore os temas e escolha o que melhor combina com você.",
            icon: Sparkles,
            link: "/app/configuracoes",
            isDone: settings.themeId !== "midnight" && settings.themeId !== "golden-hour",
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

    // Anima saída antes de fechar
    const closeGuide = () => {
        setIsExiting(true)
        setTimeout(() => {
            updateSettings({ showGuide: false })
        }, 400)
    }

    const handleMinimize = () => {
        setIsMinimized(true)
    }

    const baseClasses = cn(
        "fixed z-[60] transition-all duration-400 ease-in-out",
        // Posição base e tamanho seguro mobile-first
        isMinimized
            ? "bottom-24 right-4 sm:bottom-6 sm:right-6 w-14 h-14"
            : "bottom-24 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-full max-w-sm",
        // Animação de entrada
        isVisible && !isExiting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        // Saída
        isExiting ? "opacity-0 scale-95 translate-y-4" : ""
    )

    if (allDone) {
        return (
            <div className={baseClasses}>
                <Card className="p-4 bg-primary text-primary-foreground border-none shadow-2xl flex items-center gap-4 rounded-2xl">
                    <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold">Missão Cumprida!</p>
                        <p className="text-xs opacity-90">Você concluiu o guia básico do Valore.</p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={closeGuide}
                        className="hover:bg-white/10 shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className={baseClasses}>
            {isMinimized ? (
                <Button
                    onClick={() => setIsMinimized(false)}
                    className="w-14 h-14 rounded-full shadow-2xl p-0 flex items-center justify-center"
                    aria-label="Abrir Guia"
                >
                    <Sparkles className="h-6 w-6" />
                </Button>
            ) : (
                <Card className="overflow-hidden border-primary/20 shadow-[0_20px_50px_-12px_rgba(var(--primary),0.3)] bg-card/95 backdrop-blur-md rounded-[2rem]">
                    {/* Header */}
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
                                onClick={handleMinimize}
                                aria-label="Minimizar"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-white/10 rounded-full"
                                onClick={closeGuide}
                                aria-label="Fechar guia"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                        {/* Indicadores de progresso */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {missions.map((m, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            i === activeIndex ? "w-6 bg-primary" : m.isDone ? "w-2 bg-emerald-500" : "w-2 bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {activeIndex + 1} / {missions.length}
                            </span>
                        </div>

                        {/* Missão atual */}
                        <div className="flex gap-3 sm:gap-4 items-start">
                            <div className={cn(
                                "p-2 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0",
                                currentMission.isDone ? "bg-emerald-500/10" : "bg-primary/10"
                            )}>
                                <currentMission.icon className={cn(
                                    "h-5 w-5 sm:h-6 sm:w-6",
                                    currentMission.isDone ? "text-emerald-500" : "text-primary"
                                )} />
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                                <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                                    {currentMission.title}
                                    {currentMission.isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {currentMission.description}
                                </p>
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-3 pt-2">
                            <Link href={currentMission.link} className="flex-1">
                                <Button className="w-full rounded-xl font-bold gap-2 group text-xs sm:text-sm h-10 sm:h-11">
                                    {currentMission.cta}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl border-border hover:bg-muted h-10 w-10 sm:h-11 sm:w-11"
                                    onClick={handlePrev}
                                    disabled={activeIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl border-border hover:bg-muted h-10 w-10 sm:h-11 sm:w-11"
                                    onClick={handleNext}
                                    disabled={activeIndex === missions.length - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progresso total */}
                    <div className="h-1.5 w-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            )}
        </div>
    )
}
