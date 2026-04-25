import { formatCurrency } from "../services";

/**
 * Determina o status visual e semântico de um orçamento com base no gasto.
 */
export const getBudgetStatus = (spent: number, total: number) => {
    if (total <= 0) return { color: 'text-primary', bg: 'bg-primary', label: 'OK', level: 'safe' };

    const percentage = (spent / total) * 100;

    if (percentage >= 90) {
        return {
            color: 'text-danger',
            bg: 'bg-danger',
            label: 'Crítico',
            level: 'critical'
        };
    }

    if (percentage >= 70) {
        return {
            color: 'text-warning',
            bg: 'bg-warning',
            label: 'ATENÇÃO',
            level: 'warning'
        };
    }

    return {
        color: 'text-primary',
        bg: 'bg-primary',
        label: 'OK',
        level: 'safe'
    };
};

/**
 * Formata o valor restante de forma cognitiva ("Disponível: R$ X" ou "Excedeu R$ X").
 */
export const formatBudgetRemaining = (spent: number, total: number): string => {
    const diff = total - spent;

    if (diff < 0) {
        return `Excedeu ${formatCurrency(Math.abs(diff))}`;
    }

    if (diff === 0) {
        return "Limite atingido";
    }

    return `Disponível: ${formatCurrency(diff)}`;
};
