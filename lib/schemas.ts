import { z } from "zod"

/**
 * Esquema de validação para Ativos (Investimentos)
 */
export const assetSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    targetPercentage: z.number().min(0).max(100),
    quantity: z.number().min(0),
    price: z.number().min(0),
    bankId: z.number().optional(),
})

/**
 * Esquema de validação para Categorias de Orçamento
 */
export const categorySchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    percentage: z.number().min(0).max(100),
    budgeted: z.number().min(0),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida"),
})

/**
 * Esquema de validação para Subcategorias
 */
export const subcategorySchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    budgeted: z.number().min(0),
    spent: z.number().min(0),
})

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
