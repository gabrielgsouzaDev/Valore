/**
 * @file lib/migration.ts
 * @description Serviço de migração de dados do LocalStorage para o IndexedDB (Dexie).
 *
 * PROTOCOLO DE MIGRAÇÃO:
 * 1. A aplicação inicia e verifica se o schema do IndexedDB é mais recente que o LocalStorage.
 * 2. Se sim, o UpdateGateModal é exibido, forçando o usuário a baixar um backup JSON.
 * 3. Após confirmação, este serviço é executado: lê os dados do LocalStorage e os injeta no Dexie.
 * 4. Ao final, o LocalStorage é marcado como migrado para evitar re-execução.
 * 5. A persistência primária passa a ser o IndexedDB.
 *
 * NOTA SISTEMA PRÉ-PRODUÇÃO:
 * Como o sistema ainda não está em produção real, a migração opera sobre dados de exemplo
 * e não precisa garantir integridade de dados de usuário real.
 *
 * @see useUpdateGate.ts para o hook que gerencia o fluxo de estado desta migração.
 */

import { db } from "@/lib/db"
import { STORAGE_KEY } from "@/lib/constants"
import { STORAGE_CONFIG } from "@/lib/business-constants"
import { appStorageSchema } from "@/lib/schemas"

// ─── Chave de controle de versão do IndexedDB ─────────────────────────────────

/** Chave usada no LocalStorage apenas para registrar a versão do schema migrado. */
export const IDB_VERSION_KEY = "valore_idb_version"

/** Versão atual do schema do IndexedDB. Incrementar ao adicionar novas stores/índices. */
export const CURRENT_IDB_VERSION = 4

// ─── Utilitário de Backup ─────────────────────────────────────────────────────

/**
 * Gera e baixa um arquivo JSON contendo todo o conteúdo do LocalStorage.
 *
 * Esta função é chamada como etapa obrigatória antes da migração para garantir
 * que o usuário tenha um ponto de restauração seguro.
 *
 * @returns O objeto de dados exportado ou null se o LocalStorage estiver vazio.
 */
export function exportLocalStorageBackup(): Record<string, unknown> | null {
    if (typeof window === "undefined") return null

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    let parsed: Record<string, unknown>
    try {
        parsed = JSON.parse(raw) as Record<string, unknown>
    } catch {
        // Dados corrompidos — exporta como string bruta com metadados de emergência
        parsed = {
            _emergency_export: true,
            _raw: raw,
            _exportedAt: new Date().toISOString(),
        }
    }

    const dataToExport = {
        _app: "valore",
        _version: STORAGE_CONFIG.VERSION,
        _exportedAt: new Date().toISOString(),
        _source: "localstorage_backup",
        ...parsed,
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `valore-backup-pre-idb-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return dataToExport
}

/**
 * Prepara o backup do LocalStorage e o copia para a área de transferência como string.
 * Fallback essencial para PWAs mobile onde downloads de arquivos podem falhar.
 * 
 * @returns true se copiado com sucesso, falso caso contrário.
 */
export async function copyLocalStorageBackupToClipboard(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.clipboard) return false

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    try {
        const parsed = JSON.parse(raw)
        const dataToExport = {
            _app: "valore",
            _version: STORAGE_CONFIG.VERSION,
            _exportedAt: new Date().toISOString(),
            ...parsed,
        }
        await navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2))
        return true
    } catch {
        return false
    }
}

// ─── Serviço de Migração ──────────────────────────────────────────────────────

/** Resultado de uma operação de migração. */
export type MigrationResult = {
    success: boolean
    /** Número de registros migrados por store. */
    counts: {
        assets: number
        categories: number
        goals: number
        transactions: number
        creditCards: number
        cardExpenses: number
        banks: number
        patrimonialHistory: number
        settings: boolean
    }
    error?: string
}

/**
 * Executa a migração completa do LocalStorage para o IndexedDB.
 *
 * FLUXO:
 * 1. Lê e valida os dados do LocalStorage com Zod.
 * 2. Limpa as stores existentes no Dexie (garante idempotência).
 * 3. Insere todos os registros em massa usando `bulkPut`.
 * 4. Registra a versão migrada no LocalStorage.
 * 5. Marca o localStorage como "migrado" (preserva os dados como fallback).
 *
 * @returns {Promise<MigrationResult>} Resultado detalhado da migração.
 */
export async function migrateLocalStorageToIndexedDB(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        counts: {
            assets: 0,
            categories: 0,
            goals: 0,
            transactions: 0,
            creditCards: 0,
            cardExpenses: 0,
            banks: 0,
            patrimonialHistory: 0,
            settings: false,
        }
    }

    // --- Etapa 1: Preparar StoragePersistence --------------------------------
    await requestStoragePersistence()

    // --- Etapa 2: Ler e Validar dados do LocalStorage -----------------------
    let data: ReturnType<typeof appStorageSchema.parse> | null = null

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            const validation = appStorageSchema.safeParse(parsed)
            if (validation.success) {
                data = validation.data
            }
        }
    } catch (error) {
        result.error = `Falha ao ler LocalStorage: ${String(error)}`
        return result
    }

    // --- Etapa 3: Popular o Dexie -------------------------------------------
    try {
        await db.transaction("rw",
            [db.assets, db.categories, db.goals, db.transactions,
            db.creditCards, db.cardExpenses, db.banks, db.patrimonialHistory, db.settings],
            async () => {
                // Limpar stores antes de inserir (evita duplicatas)
                await Promise.all([
                    db.assets.clear(),
                    db.categories.clear(),
                    db.goals.clear(),
                    db.transactions.clear(),
                    db.creditCards.clear(),
                    db.cardExpenses.clear(),
                    db.banks.clear(),
                    db.patrimonialHistory.clear(),
                    db.settings.clear(),
                ])

                if (data) {
                    // Inserção em massa (bulkPut é idempotente com chaves existentes)
                    if (data.assets?.length) {
                        await db.assets.bulkPut(data.assets)
                        result.counts.assets = data.assets.length
                    }
                    if (data.categories?.length) {
                        await db.categories.bulkPut(data.categories)
                        result.counts.categories = data.categories.length
                    }
                    if (data.goals?.length) {
                        await db.goals.bulkPut(data.goals)
                        result.counts.goals = data.goals.length
                    }
                    if (data.transactions?.length) {
                        await db.transactions.bulkPut(data.transactions)
                        result.counts.transactions = data.transactions.length
                    }
                    if (data.creditCards?.length) {
                        await db.creditCards.bulkPut(data.creditCards)
                        result.counts.creditCards = data.creditCards.length
                    }
                    if (data.cardExpenses?.length) {
                        await db.cardExpenses.bulkPut(data.cardExpenses)
                        result.counts.cardExpenses = data.cardExpenses.length
                    }
                    if (data.banks?.length) {
                        await db.banks.bulkPut(data.banks)
                        result.counts.banks = data.banks.length
                    }
                    if (data.patrimonialHistory?.length) {
                        await db.patrimonialHistory.bulkPut(data.patrimonialHistory)
                        result.counts.patrimonialHistory = data.patrimonialHistory.length
                    }
                    if (data.settings) {
                        await db.settings.put({ ...data.settings, id: 1 })
                        result.counts.settings = true
                    }
                }
            }
        )
    } catch (error) {
        result.error = `Falha durante a inserção no IndexedDB: ${String(error)}`
        return result
    }

    // --- Etapa 4: Verificação de integridade --------------------------------
    const assetCount = await db.assets.count()
    const expectedAssets = data?.assets?.length ?? 0
    if (expectedAssets > 0 && assetCount === 0) {
        result.error = "Verificação de integridade falhou: assets não foram inseridos."
        return result
    }

    // --- Etapa 5: Marcar migração como concluída ----------------------------
    try {
        window.localStorage.setItem(IDB_VERSION_KEY, String(CURRENT_IDB_VERSION))
        // O LocalStorage é preservado como fallback de emergência, mas marcado como migrado.
        // Não é removido para garantir que dados não sejam perdidos.
    } catch {
        // Falha ao marcar não deve impedir o uso da app
    }

    result.success = true
    return result
}

// ─── Verificação de Versão ────────────────────────────────────────────────────

/**
 * Verifica se o schema atual do IndexedDB é mais recente que o registrado no LocalStorage.
 *
 * @returns `true` se uma migração é necessária, `false` caso contrário.
 */
export function isMigrationNeeded(): boolean {
    if (typeof window === "undefined") return false

    const hasLocalStorageData = !!window.localStorage.getItem(STORAGE_KEY)
    const hasBeenMigrated = !!window.localStorage.getItem(IDB_VERSION_KEY)

    // A migração só é necessária se houver dados no LocalStorage e NUNCA tiver sido realizada uma migração para o IndexedDB.
    // Isso evita que atualizações de código limpem os dados novos do usuário no IndexedDB para re-importar dados antigos do LocalStorage.
    return hasLocalStorageData && !hasBeenMigrated
}

// ─── Storage Persistence API ──────────────────────────────────────────────────

/**
 * Solicita ao navegador que persista o armazenamento do IndexedDB permanentemente.
 *
 * Quando garantido, o navegador não apagará os dados do IndexedDB em limpezas automáticas
 * de cache ou quando o dispositivo tiver pouco espaço.
 *
 * @returns `true` se a persistência foi garantida, `false` caso contrário.
 */
export async function requestStoragePersistence(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) {
        return false
    }

    try {
        const isPersisted = await navigator.storage.persist()
        return isPersisted
    } catch {
        return false
    }
}
