import type { InvestmentStrategy } from "./core"

export type Settings = {
    nome: string
    rendaMensal: number
    capitalInvestido: number
    themeId: string
    moeda?: string
    proximidadeAlerta?: number
    investmentStrategy: InvestmentStrategy
    onboardingCompleted: boolean
    activeModules?: Record<string, boolean>
    isPrivate?: boolean
    isDemoMode?: boolean
    showGuide?: boolean
    shownGuides?: string[]
    activeGuideStep?: number | null
}
