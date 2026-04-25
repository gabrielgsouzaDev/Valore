import { formatCurrency } from "../services";

export type BudgetStatus = 'critical' | 'warning' | 'safe'

export interface StatusConfig {
    level: BudgetStatus
    label: string
    color: string // classe do texto
    bg: string    // classe do background
    border: string // classe da borda
    barColor: string // cor da barra de progresso
}

/**
 * Determina o status do orçamento com base na porcentagem de gasto.
 */
export function getBudgetStatus(spent: number, budgeted: number): StatusConfig {
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0

    if (percentage >= 100) {
        return {
            level: 'critical',
            label: 'CRÍTICO',
            color: 'text-danger',
            bg: 'bg-danger/5',
            border: 'border-danger/30',
            barColor: 'bg-danger'
        }
    }

    if (percentage >= 80) {
        return {
            level: 'warning',
            label: 'ATENÇÃO',
            color: 'text-warning',
            bg: 'bg-warning/5',
            border: 'border-warning/20',
            barColor: 'bg-warning'
        }
    }

    return {
        level: 'safe',
        label: 'OK',
        color: 'text-success',
        bg: 'bg-success/5',
        border: 'border-border/50',
        barColor: 'bg-success'
    }
}

/**
 * Retorna a cor CSS variável para uso em estilos inline ou progress bars.
 */
export function getStatusColor(spent: number, budgeted: number): string {
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0

    if (percentage >= 100) return 'var(--danger)'
    if (percentage >= 80) return 'var(--warning)'
    return 'var(--success)'
}
