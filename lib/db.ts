/**
 * @file lib/db.ts
 * @description Configuração do banco de dados IndexedDB utilizando Dexie.js.
 *
 * ARQUITETURA:
 * - Substitui o LocalStorage como mecanismo de persistência primário da aplicação.
 * - Suporta migrações de schema nativas via `.version(n).stores({...})`.
 * - Singleton: uma única instância do banco é exportada e reutilizada em toda a app.
 *
 * VERSIONAMENTO DE SCHEMA:
 * - Ao adicionar novos campos indexados, crie um `.version(n+1)` com o schema incrementado.
 * - Nunca modifique versões antigas. Apenas adicione novas via `.version()`.
 * - Exemplo para adicionar índice `ticker` em `assets`:
 *   `.version(2).stores({ assets: '++id, type, ticker', assetCache: 'ticker, timestamp' })`
 */

import Dexie, { type Table } from "dexie"
import type {
    Asset,
    Category,
    Goal,
    Settings,
    ScheduledTransaction,
    CreditCard,
    CardExpense,
    Bank,
    PatrimonialSnapshot,
    AssetCache,
    AssetHistoryItem,
} from "@/lib/types"

// ─── Schema do Banco de Dados ─────────────────────────────────────────────────

/**
 * Tipo para Configurações armazenada com ID fixa (singleton).
 * Usamos id=1 para representar o único registro de configurações do usuário.
 */
export type SettingsRecord = Settings & { id?: number }

/**
 * ValoreDB: Classe principal do banco de dados Valore.
 *
 * Cada propriedade da classe corresponde a uma "store" (tabela) no IndexedDB.
 * Os tipos são inferidos automaticamente pelo Dexie.
 */
export class ValoreDB extends Dexie {
    /** Store de ativos de investimento. `++id` = auto-incremento. */
    assets!: Table<Asset>

    /** Store de categorias de orçamento (Economia). */
    categories!: Table<Category>

    /** Store de metas financeiras (Objetivos). */
    goals!: Table<Goal>

    /** Store de transações agendadas (Transações). */
    transactions!: Table<ScheduledTransaction>

    /** Store de cartões de crédito. */
    creditCards!: Table<CreditCard>

    /** Store de despesas associadas a cartões. */
    cardExpenses!: Table<CardExpense>

    /** Store de contas bancárias e carteiras. */
    banks!: Table<Bank>

    /** Store de histórico patrimonial (snapshots diários). */
    patrimonialHistory!: Table<PatrimonialSnapshot & { id?: number }>

    /**
     * Store de configurações do usuário.
     * Armazena um único registro com id=1.
     */
    settings!: Table<SettingsRecord>

    /** Store de cache de dados de mercado (Brapi). */
    assetCache!: Table<AssetCache>

    /** Store de histórico de preços para sparklines. */
    assetHistory!: Table<AssetHistoryItem>

    constructor() {
        super("ValoreDB")

        /**
         * Schema V1 — Estado inicial da aplicação.
         *
         * Sintaxe do Dexie:
         * - `++id` = chave primária auto-incremento
         * - `id` = chave primária manual (definida pela app)
         * - `[campo1+campo2]` = índice composto (para queries em múltiplos campos)
         * - `campo` = índice simples (para queries eficientes por campo)
         *
         * ESTRATÉGIA DE INDEXAÇÃO:
         * Apenas campos usados em `.where()`, `.orderBy()` ou `.equals()` precisam
         * ser indexados. Campos read-only (ex: nome, description) NÃO são indexados
         * para minimizar overhead de escrita.
         *
         * Campos não listados são armazenados mas não indexados.
         */
        this.version(1).stores({
            // Ativos: filtro por tipo e vinculação com banco
            assets: "++id, type, bankId",

            // Categorias: sem filtros frequentes além do id
            categories: "++id",

            // Metas: filtro por prioridade e vinculação com banco
            goals: "++id, priority, bankId",

            // Transações: filtros críticos por status, data de vencimento, tipo e banco
            // [status+dueDate] = índice composto para queries "pendente ordenado por data"
            transactions: "++id, status, dueDate, type, bankId, [status+dueDate]",

            // Cartões: sem filtros frequentes
            creditCards: "++id",

            // Despesas de cartão: filtro por cardId (query por fatura) e data
            // [cardId+purchaseDate] = índice composto para queries de fatura por cartão
            cardExpenses: "++id, cardId, purchaseDate, [cardId+purchaseDate]",

            // Bancos: sem filtros frequentes além do id
            banks: "++id",

            // Histórico Patrimonial: ordenado por data
            patrimonialHistory: "++id, date",

            // Configurações: singleton com id=1
            settings: "++id",
        })

        /**
         * Schema V2 — Cache de Dados de Mercado (Brapi)
         * Adiciona stores para evitar over-fetching da API e permitir sparklines.
         */
        this.version(2).stores({
            // Cache de dados fundamentais (Market Cap, Volume, etc)
            // Ticker é a chave primária para busca rápida
            assetCache: "ticker, timestamp",

            // Histórico de preços para gráficos (Sparklines)
            // Chave composta [ticker+timestamp] para séries temporais por ativo
            assetHistory: "++id, ticker, timestamp, [ticker+timestamp]"
        })

        /**
         * Schema V3 — Replica todas as stores do V1 para o Dexie não tentar
         * re-criar a tabela de settings com a chave inválida.
         *
         * O Dexie replica automaticamente stores do V1 para V3, mas é mais seguro
         * declarar explicitamente para evitar re-criação de chave primária.
         */
        this.version(3).stores({
            assets: "++id, type, bankId",
            categories: "++id",
            goals: "++id, priority, bankId",
            transactions: "++id, status, dueDate, type, bankId, [status+dueDate]",
            creditCards: "++id",
            cardExpenses: "++id, cardId, purchaseDate, [cardId+purchaseDate]",
            banks: "++id",
            patrimonialHistory: "++id, date",
            // Mantém ++id para compatibilidade com dados existentes
            settings: "++id",
        })

        /**
         * Schema V4 — Replica TODAS as stores para contornar instalações travadas
         * entre V1→V3. O Dexie exige que todas as stores existam nas versões
         * declaradas para evitar re-criação de chave primária.
         */
        this.version(4).stores({
            assets: "++id, type, bankId",
            categories: "++id",
            goals: "++id, priority, bankId",
            transactions: "++id, status, dueDate, type, bankId, [status+dueDate]",
            creditCards: "++id",
            cardExpenses: "++id, cardId, purchaseDate, [cardId+purchaseDate]",
            banks: "++id",
            patrimonialHistory: "++id, date",
            settings: "++id",
            assetCache: "ticker, timestamp",
            assetHistory: "++id, ticker, timestamp, [ticker+timestamp]",
        })
    }
}

// ─── Instância Singleton ──────────────────────────────────────────────────────

/**
 * Instância singleton do ValoreDB.
 * Importar esta variável em qualquer parte da aplicação para acessar o banco.
 *
 * @example
 * import { db } from "@/lib/db"
 * const assets = await db.assets.toArray()
 */
export const db = new ValoreDB()
