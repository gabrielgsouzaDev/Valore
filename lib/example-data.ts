import { Settings, Bank, Asset, Category, CreditCard, CardExpense } from "./types"

export const defaultSettings: Settings = {
    nome: "",
    rendaMensal: 0,
    capitalInvestido: 0,
    themeId: "paper",
    onboardingCompleted: false,
    investmentStrategy: "waterfall",
    activeGuideStep: null,
    showGuide: false,
    shownGuides: [],
    activeModules: {
        investimentos: true,
        economia: true,
        cartoes: true,
    },
}

export const exampleData = {
    settings: { ...defaultSettings, nome: "", rendaMensal: 6500, capitalInvestido: 46000 },
    banks: [
        { id: 1, name: "Nubank", type: "banco_digital", color: "violet", balance: 3200, isMain: true, notes: "Conta do dia a dia" },
        { id: 2, name: "Itaú", type: "banco_tradicional", color: "orange", balance: 8400, isMain: false, notes: "Reserva imediata" }
    ] as Bank[],
    assets: [
        { id: 1, name: "IVVB11", type: "ETF", targetPercentage: 35, currentValue: 11000, quantity: 40, price: 275.00, averagePrice: 210.00, bankId: 2, ceilingPrice: 320, priority: 2 },
        { id: 2, name: "Bitcoin", type: "Cripto", targetPercentage: 10, currentValue: 6440, quantity: 0.02, price: 322000, averagePrice: 150000, bankId: 2, ceilingPrice: 280000, priority: 4 },
        { id: 3, name: "Tesouro Selic 2029", type: "Renda Fixa", targetPercentage: 40, currentValue: 21200, quantity: 1, price: 21200, averagePrice: 21200, bankId: 2, priority: 1 },
        { id: 4, name: "XPLG11 FII", type: "FII", targetPercentage: 15, currentValue: 7360, quantity: 70, price: 105.14, averagePrice: 98.50, bankId: 2, priority: 3 }
    ] as Asset[],
    categories: [
        {
            id: 1, name: "Moradia", percentage: 30, budgeted: 1950, spent: 1950, color: "blue", expanded: false, subcategories: [
                { id: 11, name: "Aluguel", budgeted: 1500, spent: 1500 },
                { id: 12, name: "Condomínio", budgeted: 280, spent: 280 },
                { id: 13, name: "Energia", budgeted: 170, spent: 170 }
            ]
        },
        {
            id: 2, name: "Alimentação", percentage: 15, budgeted: 975, spent: 700, color: "emerald", expanded: false, subcategories: [
                { id: 21, name: "Mercado", budgeted: 700, spent: 530 },
                { id: 22, name: "Ifood", budgeted: 275, spent: 170 }
            ]
        },
        { id: 3, name: "Transporte", percentage: 10, budgeted: 650, spent: 450, color: "orange", expanded: false, subcategories: [] },
        { id: 4, name: "Lazer", percentage: 5, budgeted: 325, spent: 220, color: "rose", expanded: false, subcategories: [] },
        { id: 5, name: "Investimentos", percentage: 35, budgeted: 2275, spent: 2100, color: "cyan", expanded: false, subcategories: [] },
        { id: 6, name: "Saúde", percentage: 5, budgeted: 325, spent: 410, color: "red", expanded: false, subcategories: [] }
    ] as Category[],
    creditCards: [
        { id: 1, name: "Nubank Ultravioleta", limit: 15000, closingDay: 25, dueDay: 2, color: "violet", bankId: 1, last4: "4022" },
        { id: 2, name: "Mercado Pago", limit: 5000, closingDay: 1, dueDay: 10, color: "green", bankId: 1, last4: "8890" }
    ] as CreditCard[],
    cardExpenses: [
        { id: 1, description: "MacBook Air M2", totalAmount: 8500, purchaseDate: "2026-03-04T12:00:00.000Z", installments: 10, cardId: 1 },
        { id: 2, description: "Jantar especial", totalAmount: 350, purchaseDate: "2026-03-01T12:00:00.000Z", installments: 1, cardId: 1 },
        { id: 3, description: "Supermercado mensal", totalAmount: 680, purchaseDate: "2026-03-03T12:00:00.000Z", installments: 1, cardId: 2 },
        { id: 4, description: "Academia anual", totalAmount: 1200, purchaseDate: "2026-02-01T12:00:00.000Z", installments: 12, cardId: 2 }
    ] as CardExpense[],
}
