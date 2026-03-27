"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import {
    X, ArrowRight, TrendingUp, Wallet, Target, Receipt, CreditCard, LayoutDashboard,
    HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Conteúdo dos guias por rota
const GUIDE_CONTENT: Record<string, { title: string; icon: any; steps: string[] }> = {
    "/": {
        title: "Bem-vindo ao Dashboard",
        icon: LayoutDashboard,
        steps: [
            "Este é o seu centro de comando. Aqui você vê o resumo consolidado de todo o seu patrimônio.",
            "Acompanhe o progresso das suas metas e veja rapidamente o quanto ainda pode gastar no mês.",
            "Dica: Clique nos cards para ir direto ao módulo detalhado."
        ]
    },
    "/investimentos": {
        title: "Dominando Investimentos",
        icon: TrendingUp,
        steps: [
            "Gerencie seus ativos (Ações, FIIs, Cripto) e acompanhe o balanceamento da sua carteira.",
            "O 'One-Tap Builder' usa sua estratégia (Rebalanceamento, Teto, Proporcional) para sugerir onde aportar.",
            "Mantenha seus ativos dentro das metas para minimizar riscos e maximizar o retorno."
        ]
    },
    "/economia": {
        title: "Seu Orçamento sob Controle",
        icon: Wallet,
        steps: [
            "Defina limites mensais para cada categoria de gastos (Moradia, Lazer, Saúde).",
            "Crie subcategorias para um detalhamento profundo (ex: Netflix dentro de Lazer).",
            "A barra de progresso muda de cor conforme você se aproxima do limite orçado."
        ]
    },
    "/transacoes": {
        title: "Fluxo de Caixa Inteligente",
        icon: Receipt,
        steps: [
            "Registre todas as entradas e saídas. Separação clara entre o que é recorrente e o que é único.",
            "Use a aba 'Histórico' para ver o passado e 'Agendados' para prever o seu saldo futuro.",
            "Crie categorias globais 'on-the-fly' diretamente no formulário de transação."
        ]
    },
    "/cartoes": {
        title: "Gestão de Crédito Premium",
        icon: CreditCard,
        steps: [
            "Acompanhe o limite disponível e a dívida total de todos os seus cartões em um só lugar.",
            "Veja a projeção das faturas para os próximos 12 meses, facilitando o planejamento de parcelas.",
            "Dica: O sistema sugere o melhor dia para compra baseado na data de fechamento."
        ]
    },
    "/objetivos": {
        title: "Construindo o Futuro",
        icon: Target,
        steps: [
            "Planeje sua Reserva de Emergência, viagens ou compras grandes.",
            "Defina uma data alvo e veja quanto você precisa poupar mensalmente para chegar lá.",
            "A cor do objetivo indica se você está no caminho certo ou se precisa aumentar o aporte."
        ]
    }
}

export function ModuleGuide() {
    const pathname = usePathname()
    const { settings, updateSettings } = useApp()
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [hasBeenShown, setHasBeenShown] = useState<Record<string, boolean>>({})

    const content = GUIDE_CONTENT[pathname] || null

    // Mostra o guia automaticamente se:
    // 1. settings.showGuide for verdadeiro
    // 2. Tivermos conteúdo para a rota atual
    // 3. Ainda não tivermos mostrado nesta sessão (para não ser irritante)
    useEffect(() => {
        if (settings.showGuide && content && !hasBeenShown[pathname]) {
            setIsVisible(true)
            setCurrentStep(0)
        }
    }, [pathname, settings.showGuide, content, hasBeenShown])

    const handleNext = () => {
        if (!content) return
        if (currentStep < content.steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleClose()
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        setHasBeenShown(prev => ({ ...prev, [pathname]: true }))
    }

    const handleDismissForever = () => {
        updateSettings({ showGuide: false })
        handleClose()
    }

    if (!content || !isVisible) return (
        <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-[40] p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-all group"
            title="Ver tutorial do módulo"
        >
            <HelpCircle className="h-6 w-6" />
            <span className="absolute right-full mr-3 bg-card border border-border text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"> Ajuda rápida </span>
        </button>
    )

    const Icon = content.icon

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
            <Card className="w-full max-w-sm overflow-hidden border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-md animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-500">
                <div className="p-1 bg-primary/10">
                    <div
                        className="h-1 bg-primary transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / content.steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-foreground">{content.title}</h3>
                        </div>
                        <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="min-h-[80px] py-2">
                        <p className="text-sm text-foreground leading-relaxed animate-in fade-in duration-500">
                            {content.steps[currentStep]}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90 font-bold group">
                            {currentStep === content.steps.length - 1 ? "Entendi!" : "Próximo"}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <div className="flex items-center justify-between gap-4 pt-1">
                            <button
                                onClick={handleDismissForever}
                                className="text-[10px] text-muted-foreground hover:text-danger hover:underline transition-colors"
                            >
                                Não mostrar tutoriais
                            </button>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {currentStep + 1} de {content.steps.length}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
