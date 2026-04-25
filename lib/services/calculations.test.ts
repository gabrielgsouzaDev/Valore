import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Asset, CardExpense, CreditCard } from "@/lib/types"
import {
    calculateInvestmentDistribution,
    calculateInvoices,
    calculateTotalNetWorth,
    getAssetBarColor,
    getEconomyBarColor,
} from "./calculations"

// ─── Factories ────────────────────────────────────────────────────────────────
// Constroem entidades válidas preenchendo apenas os campos que cada cálculo lê.

function makeAsset(p: Partial<Asset> & { id: number; name: string }): Asset {
    return {
        type: "Ação",
        targetPercentage: 0,
        currentValue: 0,
        quantity: 0,
        price: 0,
        averagePrice: 0,
        ...p,
    }
}

function makeCard(p: Partial<CreditCard> & { id: number }): CreditCard {
    return { name: `Card ${p.id}`, limit: 0, closingDay: 20, dueDay: 28, color: "#000", ...p }
}

function makeExpense(p: Partial<CardExpense> & { id: number; cardId: number }): CardExpense {
    return {
        description: `Expense ${p.id}`,
        totalAmount: 0,
        installments: 1,
        purchaseDate: "2026-01-10T12:00:00",
        ...p,
    }
}

// ─── calculateInvestmentDistribution — as 4 estratégias ─────────────────────────

describe("calculateInvestmentDistribution", () => {
    it("retorna [] para aporte <= 0 ou NaN", () => {
        const assets = [makeAsset({ id: 1, name: "A", targetPercentage: 100 })]
        expect(calculateInvestmentDistribution(0, assets, 0, "rebalance")).toEqual([])
        expect(calculateInvestmentDistribution(-100, assets, 0, "rebalance")).toEqual([])
        expect(calculateInvestmentDistribution(NaN, assets, 0, "rebalance")).toEqual([])
    })

    describe("rebalance", () => {
        it("distribui igualmente entre dois ativos 50/50 partindo do zero", () => {
            const assets = [
                makeAsset({ id: 1, name: "A", targetPercentage: 50 }),
                makeAsset({ id: 2, name: "B", targetPercentage: 50 }),
            ]
            const recs = calculateInvestmentDistribution(1000, assets, 0, "rebalance")
            expect(recs).toEqual([
                { name: "A", amount: 500 },
                { name: "B", amount: 500 },
            ])
        })

        it("aloca apenas no ativo abaixo do alvo (ignora o já balanceado)", () => {
            const assets = [
                makeAsset({ id: 1, name: "A", targetPercentage: 50, currentValue: 1000 }),
                makeAsset({ id: 2, name: "B", targetPercentage: 50, currentValue: 0 }),
            ]
            const recs = calculateInvestmentDistribution(1000, assets, 1000, "rebalance")
            expect(recs).toEqual([{ name: "B", amount: 1000 }])
        })
    })

    describe("proportional", () => {
        it("distribui pelo peso-alvo, independente do valor atual", () => {
            const assets = [
                makeAsset({ id: 1, name: "A", targetPercentage: 60 }),
                makeAsset({ id: 2, name: "B", targetPercentage: 40 }),
            ]
            const recs = calculateInvestmentDistribution(1000, assets, 5000, "proportional")
            expect(recs).toEqual([
                { name: "A", amount: 600 },
                { name: "B", amount: 400 },
            ])
        })
    })

    describe("waterfall", () => {
        it("prioriza por priority (menor primeiro) e esgota o aporte em cascata", () => {
            const assets = [
                makeAsset({ id: 1, name: "A", targetPercentage: 50, priority: 1 }),
                makeAsset({ id: 2, name: "B", targetPercentage: 50, priority: 2 }),
            ]
            // aporte insuficiente para os dois → prioridade 1 leva tudo
            const recs = calculateInvestmentDistribution(100, assets, 1000, "waterfall")
            expect(recs).toEqual([{ name: "A", amount: 100 }])
        })

        it("preenche ambos quando há aporte suficiente", () => {
            const assets = [
                makeAsset({ id: 1, name: "A", targetPercentage: 50, priority: 1 }),
                makeAsset({ id: 2, name: "B", targetPercentage: 50, priority: 2 }),
            ]
            const recs = calculateInvestmentDistribution(1000, assets, 0, "waterfall")
            expect(recs).toEqual([
                { name: "A", amount: 500 },
                { name: "B", amount: 500 },
            ])
        })
    })

    describe("ceiling", () => {
        it("exclui ativos cujo preço está acima do preço-teto", () => {
            const assets = [
                makeAsset({ id: 1, name: "A", targetPercentage: 50, price: 10, ceilingPrice: 8 }), // acima do teto → fora
                makeAsset({ id: 2, name: "B", targetPercentage: 50, price: 5, ceilingPrice: 10 }), // dentro
            ]
            const recs = calculateInvestmentDistribution(1000, assets, 0, "ceiling")
            expect(recs).toEqual([{ name: "B", amount: 1000 }])
        })
    })
})

// ─── calculateInvoices — projeção de fatura (timers fixos) ──────────────────────

describe("calculateInvoices", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-01-15T12:00:00"))
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it("projeta 3 parcelas a partir do mês da compra", () => {
        const cards = [makeCard({ id: 1, closingDay: 20 })]
        const expenses = [
            makeExpense({ id: 1, cardId: 1, totalAmount: 300, installments: 3, purchaseDate: "2026-01-10T12:00:00" }),
        ]
        const proj = calculateInvoices(expenses, cards)

        expect(proj).toHaveLength(12)
        expect(proj[0].month).toBe("Janeiro")
        expect(proj[0].total).toBe(100)
        expect(proj[0].expenses[0].installment).toBe("1/3")
        expect(proj[1].expenses[0].installment).toBe("2/3")
        expect(proj[2].expenses[0].installment).toBe("3/3")
        expect(proj[3].total).toBe(0)
        expect(proj[3].expenses).toHaveLength(0)
    })

    it("empurra a 1ª fatura para o mês seguinte quando a compra é após o fechamento", () => {
        const cards = [makeCard({ id: 1, closingDay: 20 })]
        const expenses = [
            // dia 25 > fechamento 20 → 1ª parcela só em fevereiro
            makeExpense({ id: 1, cardId: 1, totalAmount: 200, installments: 2, purchaseDate: "2026-01-25T12:00:00" }),
        ]
        const proj = calculateInvoices(expenses, cards)

        expect(proj[0].total).toBe(0) // janeiro vazio
        expect(proj[1].expenses[0].installment).toBe("1/2")
        expect(proj[2].expenses[0].installment).toBe("2/2")
    })

    it("respeita paidInstallments deslocando o índice da parcela", () => {
        const cards = [makeCard({ id: 1, closingDay: 20 })]
        const expenses = [
            makeExpense({
                id: 1, cardId: 1, totalAmount: 400, installments: 4, paidInstallments: 2,
                purchaseDate: "2026-01-10T12:00:00",
            }),
        ]
        const proj = calculateInvoices(expenses, cards)

        expect(proj[0].expenses[0].installment).toBe("3/4")
        expect(proj[1].expenses[0].installment).toBe("4/4")
        expect(proj[2].total).toBe(0)
    })

    it("arredonda parcelas para centavos (evita drift de ponto flutuante)", () => {
        const cards = [makeCard({ id: 1, closingDay: 20 })]
        const expenses = [
            makeExpense({ id: 1, cardId: 1, totalAmount: 100, installments: 3, purchaseDate: "2026-01-10T12:00:00" }),
        ]
        const proj = calculateInvoices(expenses, cards)
        expect(proj[0].expenses[0].amount).toBe(33.33)
        expect(proj[0].total).toBe(33.33)
    })

    it("filtra por cardId quando informado", () => {
        const cards = [makeCard({ id: 1, closingDay: 20 }), makeCard({ id: 2, closingDay: 20 })]
        const expenses = [
            makeExpense({ id: 1, cardId: 1, totalAmount: 120, installments: 1 }),
            makeExpense({ id: 2, cardId: 2, totalAmount: 999, installments: 1 }),
        ]
        const proj = calculateInvoices(expenses, cards, 1)
        expect(proj[0].total).toBe(120)
        expect(proj[0].expenses.every((e) => e.cardId === 1)).toBe(true)
    })
})

// ─── Funções de cor (regras de saúde visual) ────────────────────────────────────

describe("getEconomyBarColor", () => {
    it("verde abaixo de 80% do orçado", () => {
        expect(getEconomyBarColor(50, 100)).toBe("var(--success)")
    })
    it("amarelo entre 80% e o limiar de perigo", () => {
        expect(getEconomyBarColor(85, 100)).toBe("var(--warning)")
    })
    it("vermelho ao atingir/estourar o orçado", () => {
        expect(getEconomyBarColor(100, 100)).toBe("var(--danger)")
    })
    it("verde quando não há orçamento definido", () => {
        expect(getEconomyBarColor(50, 0)).toBe("var(--success)")
    })
})

describe("getAssetBarColor", () => {
    it("primary quando o alvo é zero", () => {
        expect(getAssetBarColor(100, 0)).toBe("var(--primary)")
    })
    it("verde quando balanceado (95%–105%)", () => {
        expect(getAssetBarColor(100, 100)).toBe("var(--success)")
    })
    it("primary quando aceitável por baixo (80%–95%)", () => {
        expect(getAssetBarColor(85, 100)).toBe("var(--primary)")
    })
    it("amarelo quando acima do balanceado (105%–140%)", () => {
        expect(getAssetBarColor(120, 100)).toBe("var(--warning)")
    })
    it("vermelho quando muito fora do alvo", () => {
        expect(getAssetBarColor(50, 100)).toBe("var(--danger)")
        expect(getAssetBarColor(150, 100)).toBe("var(--danger)")
    })
})

// ─── Agregações patrimoniais e de fluxo ─────────────────────────────────────────

describe("calculateTotalNetWorth", () => {
    it("soma valor dos ativos e saldo dos bancos", () => {
        const assets = [
            makeAsset({ id: 1, name: "A", currentValue: 100 }),
            makeAsset({ id: 2, name: "B", currentValue: 200 }),
        ]
        const banks = [
            { id: 1, name: "Banco", type: "conta_corrente" as const, color: "#000", balance: 50, isMain: true },
        ]
        expect(calculateTotalNetWorth(assets, banks)).toBe(350)
        expect(calculateTotalNetWorth(assets)).toBe(300)
    })
})
