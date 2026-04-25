import { z } from "zod"
import { parseCurrency } from "@/lib/utils"

const idSchema = z.object({ id: z.number() })

export { idSchema }

export const assetSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    ticker: z.string().optional(),
    syncAvailable: z.boolean().optional(),
    type: z.enum(["Ação", "FII", "ETF", "Renda Fixa", "Cripto", "Outro"]),
    targetPercentage: z.preprocess((val) => parseCurrency(val as string), z.number().min(0).max(100)),
    quantity: z.preprocess((val) => parseCurrency(val as string), z.number().min(0)),
    price: z.preprocess((val) => parseCurrency(val as string), z.number().min(0)),
    averagePrice: z.preprocess((val) => parseCurrency(val as string), z.number().min(0)),
    annualDividend: z.preprocess((val) => parseCurrency(val as string), z.number().min(0)).optional(),
    bankId: z.number().optional(),
    currentValue: z.number(),
    ceilingPrice: z.number().optional(),
    priority: z.number().optional(),
    lastUpdated: z.string().optional(),
    lastSync: z.string().optional(),
})
export const assetWithIdSchema = assetSchema.merge(idSchema)

export const subcategoryWithIdSchema = z.object({
    id: z.number(),
    name: z.string().min(2),
    budgeted: z.number().min(0),
    spent: z.number().min(0),
})
export const categorySchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    percentage: z.number().min(0).max(100),
    budgeted: z.number().min(0),
    spent: z.number().min(0),
    color: z.string().default("slate"),
    subcategories: z.array(subcategoryWithIdSchema).optional(),
    expanded: z.boolean().optional(),
})
export const categoryWithIdSchema = categorySchema.merge(idSchema)

export const goalSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    target: z.number().positive("O valor alvo deve ser positivo"),
    current: z.number().min(0),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "Data inválida (AAAA-MM-DD)"),
    monthlyContribution: z.number().min(0),
    priority: z.enum(["alta", "média", "baixa"]),
    category: z.string(),
    bankId: z.number().optional(),
})
export const goalWithIdSchema = goalSchema.merge(idSchema)

export const transactionSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    amount: z.preprocess((val) => parseCurrency(val as string), z.number().positive("O valor deve ser positivo")),
    type: z.enum(["pagamento", "ganho"]),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "Data inválida (AAAA-MM-DD)"),
    recurrence: z.enum(["unico", "semanal", "mensal", "anual"]),
    categoryId: z.number().optional(),
    status: z.enum(["pendente", "pago", "atrasado"]),
    notes: z.string().optional(),
    bankId: z.number().optional(),
})
export const transactionWithIdSchema = transactionSchema.merge(idSchema)

export const creditCardSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    limit: z.number().positive("O limite deve ser positivo"),
    closingDay: z.number().min(1).max(31),
    dueDay: z.number().min(1).max(31),
    color: z.string().default("slate"),
    bankId: z.number().optional(),
    last4: z.string().optional(),
})
export const creditCardWithIdSchema = creditCardSchema.merge(idSchema)

export const bankSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    type: z.enum(["conta_corrente", "poupanca", "carteira_digital", "corretora", "banco_digital", "banco_tradicional", "outro"]),
    color: z.string().default("slate"),
    balance: z.number(),
    isMain: z.boolean(),
    currency: z.string().optional().default("BRL"),
    notes: z.string().optional(),
    icon: z.string().optional(),
})
export const bankWithIdSchema = bankSchema.merge(idSchema)

export const patrimonialSnapshotSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/),
    totalNetWorth: z.number(),
})

export const settingsSchema = z.object({
    nome: z.string().default("Investidor"),
    rendaMensal: z.number().default(0),
    capitalInvestido: z.number().default(0),
    themeId: z.string().default("paper"),
    moeda: z.string().default("BRL"),
    proximidadeAlerta: z.number().default(10),
    investmentStrategy: z.enum(["rebalance", "proportional", "waterfall", "ceiling"]).default("rebalance"),
    onboardingCompleted: z.boolean().default(false),
    activeModules: z.record(z.boolean()).optional(),
    isDemoMode: z.boolean().optional(),
    showGuide: z.boolean().optional(),
    shownGuides: z.array(z.string()).default([]),
    activeGuideStep: z.number().nullable().optional(),
    isPrivate: z.boolean().optional(),
})

export const cardExpenseSchema = z.object({
    cardId: z.number(),
    description: z.string().min(2),
    totalAmount: z.preprocess((val) => parseCurrency(val as string), z.number().positive()),
    installments: z.number().min(1),
    purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/),
    paidInstallments: z.number().min(0).default(0),
})
export const cardExpenseWithIdSchema = cardExpenseSchema.merge(idSchema)

export const appStorageSchema = z.object({
    _version: z.number().default(2),
    assets: z.array(assetWithIdSchema).default([]),
    categories: z.array(categoryWithIdSchema).default([]),
    goals: z.array(goalWithIdSchema).default([]),
    settings: settingsSchema.default({ themeId: "paper" }),
    transactions: z.array(transactionWithIdSchema).default([]),
    creditCards: z.array(creditCardWithIdSchema).default([]),
    cardExpenses: z.array(cardExpenseWithIdSchema).default([]),
    banks: z.array(bankWithIdSchema).default([]),
    patrimonialHistory: z.array(patrimonialSnapshotSchema).default([]),
    lastUpdated: z.string().optional(),
})

export const summaryCacheSchema = z.object({
    version: z.string(),
    totalNetWorth: z.number(),
    totalBudgeted: z.number(),
    totalSpent: z.number(),
    userName: z.string(),
    themeId: z.string(),
    lastUpdated: z.string(),
})
