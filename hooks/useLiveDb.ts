/**
 * @file hooks/useLiveDb.ts
 * @description Hook central que expõe dados em tempo real do IndexedDB (Dexie) via `useLive` (assinatura direta ao liveQuery).
 */

"use client"

import { useLive } from "@/hooks/useLive"
import { useMemo, useEffect } from "react"
import { db } from "@/lib/db"
import type {
    Asset, Category, Goal, ScheduledTransaction,
    CreditCard, CardExpense, Bank, PatrimonialSnapshot, Settings
} from "@/lib/types"
import { defaultSettings } from "@/lib/constants"

// ─── Tipo de Retorno ──────────────────────────────────────────────────────────

export type LiveDbData = {
    assets: Asset[] | undefined
    categories: Category[] | undefined
    goals: Goal[] | undefined
    transactions: ScheduledTransaction[] | undefined
    creditCards: CreditCard[] | undefined
    cardExpenses: CardExpense[] | undefined
    banks: Bank[] | undefined
    patrimonialHistory: PatrimonialSnapshot[] | undefined
    settings: Settings | undefined
    /** `true` quando todos os stores já retornaram ao menos um resultado (mesmo vazio). */
    isLoaded: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook central de dados live do Dexie.
 * Retorna todos os stores reativos. `undefined` indica carregamento inicial.
 *
 * PERFORMANCE:
 * - Cada `useLive` é independente: uma mudança em `transactions` não re-executa
 *   a query de `assets`, reduzindo renders desnecessários.
 * - O `useMemo` de `isLoaded` só recalcula quando os dados mudam efetivamente.
 */
export function useLiveDb(): LiveDbData {
    const assets = useLive(() => db.assets.toArray())
    const categories = useLive(() => db.categories.toArray())
    const goals = useLive(() => db.goals.toArray())
    const transactions = useLive(() => db.transactions.orderBy("dueDate").toArray())
    const creditCards = useLive(() => db.creditCards.toArray())
    const cardExpenses = useLive(() => db.cardExpenses.toArray())
    const banks = useLive(() => db.banks.toArray())
    const patrimonialHistory = useLive(() => db.patrimonialHistory.orderBy("date").toArray())

    // Sincronização de Settings: Usamos null para diferenciar "Carregando" de "Vazio/Não Encontrado" (fix v0.1.11)
    const settingsRecord = useLive(() => db.settings.get(1).then(s => s || null))

    /**
     * Normaliza o settings record (remove o id interno do Dexie).
     * Retorna `defaultSettings` se o banco estiver vazio (primeiro acesso).
     */
    const settings = useMemo<Settings | undefined>(() => {
        // undefined = query em execução (Loading)
        if (settingsRecord === undefined) return undefined

        // null = query terminou mas não encontrou registro (Primeiro acesso ou Reset)
        if (settingsRecord === null) return defaultSettings

        const { id: _id, ...rest } = settingsRecord
        return rest as Settings
    }, [settingsRecord])

    /**
     * `isLoaded`: true quando todos os stores já completaram sua query inicial.
     * Um store retorna `undefined` enquanto a query está em andamento.
     */
    const isLoaded = useMemo(() =>
        assets !== undefined &&
        categories !== undefined &&
        goals !== undefined &&
        transactions !== undefined &&
        creditCards !== undefined &&
        cardExpenses !== undefined &&
        banks !== undefined &&
        patrimonialHistory !== undefined &&
        settings !== undefined,
        [assets, categories, goals, transactions, creditCards, cardExpenses, banks, patrimonialHistory, settings]
    )

    /**
     * MONITOR DE PERFORMANCE (Diagnóstico)
     * Se o sistema demorar mais de 3s para carregar, avisa no console quais tabelas estão travando.
     */
    useEffect(() => {
        if (isLoaded) return

        const timer = setTimeout(() => {
            if (!isLoaded) {
                const missing = {
                    assets: assets === undefined,
                    categories: categories === undefined,
                    goals: goals === undefined,
                    transactions: transactions === undefined,
                    creditCards: creditCards === undefined,
                    cardExpenses: cardExpenses === undefined,
                    banks: banks === undefined,
                    patrimonialHistory: patrimonialHistory === undefined,
                    settings: settings === undefined
                }
                const missingTables = Object.entries(missing).filter(([_, v]) => v).map(([k]) => k)
                console.warn(`ValoreDB: O carregamento está demorando. Tabelas pendentes: ${missingTables.join(", ")}`, missing)
            }
        }, 3000)

        return () => clearTimeout(timer)
    }, [isLoaded, assets, categories, goals, transactions, creditCards, cardExpenses, banks, patrimonialHistory, settings])

    return {
        assets,
        categories,
        goals,
        transactions,
        creditCards,
        cardExpenses,
        banks,
        patrimonialHistory,
        settings,
        isLoaded,
    }
}
