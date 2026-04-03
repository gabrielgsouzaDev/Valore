"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import {
    X, ArrowRight, ArrowLeft, TrendingUp, Wallet, Target, Receipt, CreditCard, LayoutDashboard,
    HelpCircle, Sparkles, CheckCircle2, Zap, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Textos globais para o sistema de guia (Concierge)
const GUIDE_LABELS = {
    FINISH: "Entendido",
    NEXT: "Próximo Passo",
    DISMISS: "Desativar Concierge",
    BOAS_VINDAS: "Boas-vindas"
}

// Conteúdo dos guias por rota - Tom Profissional e de Valor
const GUIDE_CONTENT: Record<string, { title: string; subtitle: string; icon: any; steps: { text: string; label?: string }[] }> = {
    "/": {
        title: "Concierge Valore",
        subtitle: "Gestão Consolidada",
        icon: LayoutDashboard,
        steps: [
            { text: "Olá! Sou seu assistente Valore. Minha função é garantir que você tenha clareza absoluta sobre seu patrimônio hoje.", label: "Boas-vindas" },
            { text: "A primeira ação recomendada é observar o 'Resumo Mensal'. Ele consolida o impacto imediato das suas decisões.", label: "Ação Inicial" },
            { text: "Seu 'Trio de Valor': Patrimônio, Gastos e Metas. O sistema monitora as três frentes para você 24h por dia.", label: "Visão Geral" }
        ]
    },
    "/investimentos": {
        title: "Gestão de Ativos",
        subtitle: "Alocação Estratégica",
        icon: TrendingUp,
        steps: [
            { text: "Investir de forma técnica exige alocação equilibrada. Vamos transformar sua carteira em um plano eficiente.", label: "Metodologia" },
            { text: "Sugestão: Use o 'One-Tap Builder' para identificar qual ativo requer aporte para reequilibrar seu nível de risco.", label: "Inteligência" },
            { text: "O Preço Teto automático garante que você compre valor, não apenas ativos. O sistema sinaliza o momento certo.", label: "Vantagem Técnica" }
        ]
    },
    "/economia": {
        title: "Controle Orçamentário",
        subtitle: "Livre Fluxo de Caixa",
        icon: Wallet,
        steps: [
            { text: "O orçamento estratégico serve para garantir que cada centavo esteja trabalhando para seus objetivos maiores.", label: "Conceito" },
            { text: "Defina limites realistas para categorias chave. O sistema sugere reinvestir excedentes não utilizados no mês.", label: "Sugestão" },
            { text: "Gerencie o indicador de progresso para evitar comprometer seu patrimônio futuro com gastos excessivos.", label: "Monitoramento" }
        ]
    },
    "/transacoes": {
        title: "Transpetência de Fluxo",
        subtitle: "Visibilidade Financeira",
        icon: Receipt,
        steps: [
            { text: "A visibilidade total é a base da segurança financeira. Registre seus lançamentos para alimentar as projeções.", label: "Base" },
            { text: "A aba 'Agendado' é seu superpoder de previsão. Antecipe o saldo das próximas semanas com precisão.", label: "Gestão" },
            { text: "Crie categorias 'on-the-fly' no formulário. Elas se integram automaticamente ao seu planejamento orçamentário.", label: "Produtividade" }
        ]
    },
    "/cartoes": {
        title: "Gestão de Passivos",
        subtitle: "Eficiência de Crédito",
        icon: CreditCard,
        steps: [
            { text: "O crédito estruturado é um multiplicador de liquidez quando gerido com absoluta precisão técnica.", label: "Estratégia" },
            { text: "Analise a projeção de faturas futuras para garantir que gastos parcelados não saturem sua capacidade mensal.", label: "Projeção" },
            { text: "O indicador 'Melhor Dia' otimiza seu fluxo, permitindo o uso do capital do banco por até 40 dias sem juros.", label: "Otimização" }
        ]
    },
    "/objetivos": {
        title: "Planejamento de Metas",
        subtitle: "Engenharia de Patrimônio",
        icon: Target,
        steps: [
            { text: "Metas quantificáveis com prazos definidos são a única forma de garantir a realização dos seus projetos.", label: "Planejamento" },
            { text: "Priorize sua 'Reserva de Emergência'. Ela é a fundação que permite investimentos com tranquilidade.", label: "Fundação" },
            { text: "Monitore o progresso percentual. Cada aporte é uma compra direta da sua liberdade e projetos futuros.", label: "Acompanhamento" }
        ]
    },
    "/configuracoes": {
        title: "Personalização Elite",
        subtitle: "Configurações do Sistema",
        icon: Settings,
        steps: [
            { text: "Este é o centro de comando do Valore. Aqui você molda a experiência para o seu perfil profissional.", label: "Personalização" },
            { text: "Experimente os 23 temas disponíveis. Cada um foi projetado com harmonia cromática para reduzir a fadiga visual.", label: "Interface" },
            { text: "Gerencie seus dados e a visibilidade dos módulos. O Valore é modular e se adapta ao seu foco financeiro atual.", label: "Dados" }
        ]
    }
}

export function ModuleGuide() {
    const pathname = usePathname()
    const { settings, updateSettings } = useApp()
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    const content = GUIDE_CONTENT[pathname] || null

    // RESET de steps ao mudar de página
    useEffect(() => {
        setCurrentStep(0)
    }, [pathname])

    // Mostra o guia automaticamente se:
    // 1. settings.showGuide for verdadeiro
    // 2. Tivermos conteúdo para a rota atual
    // 3. Ainda não tivermos mostrado nesta sessão (para não ser irritante)
    useEffect(() => {
        const shownGuides = settings.shownGuides || []
        if (settings.showGuide && content && !shownGuides.includes(pathname)) {
            setIsVisible(true)
            setCurrentStep(0)
        }
    }, [pathname, settings.showGuide, content, settings.shownGuides])

    const handleNext = () => {
        if (!content) return
        if (currentStep < content.steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleClose()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        if (!settings.shownGuides?.includes(pathname)) {
            const currentShown = settings.shownGuides || []
            updateSettings({ shownGuides: [...currentShown, pathname] })
        }
    }

    const handleDismissForever = () => {
        updateSettings({ showGuide: false })
        handleClose()
    }

    if (!content || !isVisible) return (
        <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-[40] p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            title="Ver tutorial do módulo"
        >
            <Zap className="h-6 w-6 relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute right-full mr-3 bg-card border border-border text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm backdrop-blur-md">
                Guia Rápido
            </span>
        </button>
    )

    const Icon = content.icon
    const stepContent = content.steps[currentStep]

    return (
        <>
            {/* BACKDROP PREMIUN */}
            <div
                className="fixed inset-0 z-[90] bg-background/40 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={handleClose}
            />

            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pointer-events-none">
                <Card className="w-full max-w-sm overflow-hidden border-2 border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-card/95 backdrop-blur-xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 pointer-events-auto">
                    <div className="p-1 bg-primary/5">
                        <div
                            className="h-1 bg-primary transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${((currentStep + 1) / content.steps.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl shadow-inner animate-pulse">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground tracking-tight leading-none">{content.title}</h3>
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1 opacity-70">
                                        {content.subtitle}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="min-h-[100px] flex flex-col justify-center gap-3">
                            {stepContent.label && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full w-fit">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                                        {stepContent.label}
                                    </span>
                                </div>
                            )}
                            <p className="text-[15px] font-medium text-foreground leading-relaxed animate-in fade-in slide-in-from-left-4 duration-500">
                                {stepContent.text}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="w-14 border-primary/20 hover:bg-primary/5"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    onClick={handleNext}
                                    className={cn(
                                        "flex-1 bg-primary hover:bg-primary/90 font-bold group shadow-lg shadow-primary/20",
                                        currentStep === content.steps.length - 1 && "bg-success text-success-foreground hover:bg-success/90"
                                    )}
                                >
                                    {currentStep === content.steps.length - 1 ? (
                                        <>
                                            {GUIDE_LABELS.FINISH}
                                            <CheckCircle2 className="ml-2 h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            {GUIDE_LABELS.NEXT}
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-1">
                                <button
                                    onClick={handleDismissForever}
                                    className="text-[10px] text-muted-foreground hover:text-danger hover:underline transition-colors font-medium"
                                >
                                    {GUIDE_LABELS.DISMISS}
                                </button>
                                <div className="flex gap-1">
                                    {content.steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-1 w-1 rounded-full transition-all duration-300",
                                                i === currentStep ? "w-4 bg-primary" : "bg-primary/20"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}
