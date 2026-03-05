
export type ThemePreset = {
    id: string
    name: string
    description: string
    colors: {
        background: string
        card: string
        cardHover: string
        border: string
        primary: string
        primaryForeground: string
        accent: string
        accentForeground: string
        muted: string
        mutedForeground: string
        success: string
        warning: string
        danger: string
    }
}

export type Asset = {
    id: number
    name: string
    targetPercentage: number
    currentValue: number
    quantity: number
    price: number
    bankId?: number
    ceilingPrice?: number
    priority?: number
    lastUpdated?: string
}

export type Subcategory = {
    id: number
    name: string
    budgeted: number
    spent: number
}

export type Category = {
    id: number
    name: string
    percentage: number
    budgeted: number
    spent: number
    color: string
    subcategories?: Subcategory[]
    expanded?: boolean
}

export type Goal = {
    id: number
    name: string
    target: number
    current: number
    deadline: string
    monthlyContribution: number
    priority: "alta" | "média" | "baixa"
    category: string
    bankId?: number
}

export type InvestmentStrategy = "rebalance" | "proportional" | "waterfall" | "ceiling"

export type Settings = {
    nome: string
    rendaMensal: number
    capitalInvestido: number
    metaReservaEmergencia: number
    themeId: string
    moeda?: string
    proximidadeAlerta?: number
    investmentStrategy: InvestmentStrategy
    onboardingCompleted: boolean
    userFocus?: "finances" | "investments" | "both"
    activeGuideStep: number | null
    showGuide: boolean
}

export type ScheduledTransaction = {
    id: number
    name: string
    amount: number
    type: "pagamento" | "ganho"
    dueDate: string
    recurrence: "unico" | "semanal" | "mensal" | "anual"
    categoryId?: number
    status: "pendente" | "pago" | "atrasado"
    notes?: string
    bankId?: number
}

export type CreditCard = {
    id: number
    name: string
    limit: number
    closingDay: number
    dueDay: number
    color: string
    bankId?: number
}

export type CardExpense = {
    id: number
    cardId: number
    description: string
    totalAmount: number
    installments: number
    purchaseDate: string
    paidInstallments?: number
}

export type InvoiceProjection = {
    month: string
    year: number
    monthIndex: number
    total: number
    expenses: { description: string; amount: number; installment: string }[]
}

export type BankType = "conta_corrente" | "poupanca" | "carteira_digital" | "corretora" | "banco_digital" | "outro"

export type Bank = {
    id: number
    name: string
    type: BankType
    color: string
    balance: number
    isMain: boolean
    notes?: string
    icon?: string
}

export type PatrimonialSnapshot = {
    date: string
    totalNetWorth: number
}
