import { z } from "zod"

/**
 * Esquema base para objetos com ID
 */
const idSchema = z.object({
    id: z.number(),
})

/**
 * Esquema de validação para Ativos (Investimentos)
 */
export const assetSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    targetPercentage: z.number().min(0).max(100),
    quantity: z.number().min(0),
    price: z.number().min(0),
    bankId: z.number().optional(),
    currentValue: z.number(),
    lastUpdated: z.string().optional(),
})

export const assetWithIdSchema = assetSchema.merge(idSchema)

/**
 * Esquema de validação para Categorias de Orçamento
 */
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
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida"),
    subcategories: z.array(subcategoryWithIdSchema).optional(),
    expanded: z.boolean().optional(),
})

export const categoryWithIdSchema = categorySchema.merge(idSchema)

/**
 * Esquema de validação para Metas Financeiras
 */
export const goalSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    target: z.number().positive("O valor alvo deve ser positivo"),
    current: z.number().min(0),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)"),
    monthlyContribution: z.number().min(0),
    priority: z.enum(["alta", "média", "baixa"]),
    category: z.string(),
    bankId: z.number().optional(),
})

export const goalWithIdSchema = goalSchema.merge(idSchema)

/**
 * Esquema de validação para Transações Agendadas
 */
export const transactionSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    amount: z.number().positive("O valor deve ser positivo"),
    type: z.enum(["pagamento", "ganho"]),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)"),
    recurrence: z.enum(["unico", "semanal", "mensal", "anual"]),
    categoryId: z.number().optional(),
    status: z.enum(["pendente", "pago", "atrasado"]),
    notes: z.string().optional(),
    bankId: z.number().optional(),
})

export const transactionWithIdSchema = transactionSchema.merge(idSchema)

/**
 * Esquema de validação para Cartões de Crédito
 */
export const creditCardSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    limit: z.number().positive("O limite deve ser positivo"),
    closingDay: z.number().min(1).max(31),
    dueDay: z.number().min(1).max(31),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida"),
    bankId: z.number().optional(),
})

export const creditCardWithIdSchema = creditCardSchema.merge(idSchema)

/**
 * Esquema de validação para Bancos/Contas
 */
export const bankSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    type: z.enum(["conta_corrente", "poupanca", "carteira_digital", "corretora", "banco_digital", "outro"]),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida"),
    balance: z.number(),
    isMain: z.boolean(),
    notes: z.string().optional(),
    icon: z.string().optional(),
})

export const bankWithIdSchema = bankSchema.merge(idSchema)

/**
 * Esquema de validação para Histórico Patrimonial
 */
export const patrimonialSnapshotSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    totalNetWorth: z.number(),
})

/**
 * Esquema de validação para Configurações
 */
export const settingsSchema = z.object({
    nome: z.string().default("Investidor"),
    rendaMensal: z.number().default(0),
    capitalInvestido: z.number().default(0),
    metaReservaEmergencia: z.number().default(0),
    themeId: z.string().default("paper"),
    moeda: z.string().default("BRL"),
    proximidadeAlerta: z.number().default(10),
    investmentStrategy: z.enum(["rebalance", "proportional", "waterfall", "ceiling"]).default("rebalance"),
    onboardingCompleted: z.boolean().default(false),
    userFocus: z.enum(["finances", "investments", "both"]).optional(),
    activeGuideStep: z.number().nullable().default(null),
    showGuide: z.boolean().default(true),
    activeModules: z.record(z.boolean()).optional(),
})

/**
 * Esquema de validação para o Armazenamento Completo (localStorage)
 */
export const appStorageSchema = z.object({
    _version: z.number().default(1),
    assets: z.array(assetWithIdSchema).default([]),
    categories: z.array(categoryWithIdSchema).default([]),
    goals: z.array(goalWithIdSchema).default([]),
    settings: settingsSchema.default({}),
    transactions: z.array(transactionWithIdSchema).default([]),
    creditCards: z.array(creditCardWithIdSchema).default([]),
    cardExpenses: z.array(z.any()).default([]), // CardExpense schema can be added if needed
    banks: z.array(bankWithIdSchema).default([]),
    patrimonialHistory: z.array(patrimonialSnapshotSchema).default([]),
    lastUpdated: z.string().optional(),
})
