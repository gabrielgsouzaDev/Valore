/**
 * @file hooks/useUpdateGate.ts
 * @description Hook para gerenciar o "Update Gate" — o protocolo de segurança
 * que controla o acesso à aplicação durante uma migração de schema de dados.
 *
 * FLUXO DO UPDATE GATE:
 * 1. `isMigrationNeeded()` detecta se o schema atual (CURRENT_IDB_VERSION) é mais recente.
 * 2. Se sim, `gateRequired: true` bloqueia a UI e exibe o UpdateGateModal.
 * 3. O usuário clica em "Baixar Backup" → `handleDownloadBackup()` executa.
 * 4. Após o backup, o botão "Migrar e Iniciar" é habilitado.
 * 5. O usuário confirma → `handleMigrate()` executa a migração via `migrateLocalStorageToIndexedDB()`.
 * 6. Sucesso → `ready: true`, a UI é desbloqueada e o `AppProvider` é carregado.
 *
 * @returns Estado e handlers para o UpdateGateModal.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import {
    isMigrationNeeded,
    exportLocalStorageBackup,
    migrateLocalStorageToIndexedDB,
    type MigrationResult,
} from "@/lib/migration"

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Estado do processo de migração. */
type MigrationPhase =
    | "idle"              // Aguardando ação do usuário
    | "downloading"       // Baixando backup
    | "migrating"         // Executando migração para o IndexedDB
    | "success"           // Migração concluída com sucesso
    | "error"             // Falha na migração

/** Retorno do hook useUpdateGate. */
export type UpdateGateState = {
    /** Se true, o app pode ser carregado normalmente (sem gate). */
    ready: boolean
    /** Se true, o UpdateGateModal deve ser exibido. */
    gateRequired: boolean
    /** Fase atual do processo de migração. */
    phase: MigrationPhase
    /** Se true, o backup já foi baixado —habilita o botão de migração. */
    backupDownloaded: boolean
    /** Resultado detalhado da migração após conclusão. */
    migrationResult: MigrationResult | null
    /** Mensagem de erro, se houver. */
    error: string | null
    /** Inicia o download do backup de segurança. */
    handleDownloadBackup: () => void
    /** Copia o backup para o clipboard (fallback mobile). */
    handleCopyBackup: () => Promise<boolean>
    /** Pula o backup em caso de emergência (mobile stuck). */
    handleSkipBackup: () => void
    /** Executa a migração do LocalStorage para o IndexedDB. */
    handleMigrate: () => Promise<void>
    /** Força o fechamento do gate (apenas para modo de desenvolvimento). */
    handleForceReady: () => void
}

// ─── Hook Principal ───────────────────────────────────────────────────────────

/**
 * Hook que gerencia o ciclo de vida completo do Update Gate.
 *
 * @example
 * const { ready, gateRequired, phase, handleDownloadBackup, handleMigrate } = useUpdateGate()
 * if (!ready) return <UpdateGateModal ... />
 */
export function useUpdateGate(): UpdateGateState {
    const [gateRequired, setGateRequired] = useState(false)
    const [ready, setReady] = useState(false)
    const [phase, setPhase] = useState<MigrationPhase>("idle")
    const [backupDownloaded, setBackupDownloaded] = useState(false)
    const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // ── Verificação inicial de versão ─────────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return

        const needsMigration = isMigrationNeeded()
        if (needsMigration) {
            setGateRequired(true)
            // Não marca como ready até que a migração seja concluída
        } else {
            setReady(true)
        }
    }, [])

    // ── Handler: Download do Backup ───────────────────────────────────────────

    /**
     * Gera e baixa o backup de segurança do LocalStorage.
     * Após o download, habilita o botão de migração.
     */
    const handleDownloadBackup = useCallback(() => {
        setPhase("downloading")
        try {
            exportLocalStorageBackup()
            setBackupDownloaded(true)
            setPhase("idle")
        } catch (err) {
            setError(`Falha ao gerar backup: ${String(err)}`)
            setPhase("error")
        }
    }, [])

    /**
     * Alternativa para mobile: copia o backup para o clipboard.
     */
    const handleCopyBackup = useCallback(async () => {
        setPhase("downloading")
        try {
            const success = await import("@/lib/migration").then(m => m.copyLocalStorageBackupToClipboard())
            if (success) {
                setBackupDownloaded(true)
                setPhase("idle")
                return true
            }
            throw new Error("Clipboard indisponível")
        } catch (err) {
            setError(`Falha ao copiar: ${String(err)}`)
            setPhase("error")
            return false
        }
    }, [])

    /**
     * Emergência: permite avançar mesmo sem backup confirmado.
     */
    const handleSkipBackup = useCallback(() => {
        setBackupDownloaded(true)
        setPhase("idle")
        setError(null)
    }, [])

    // ── Handler: Executar Migração ────────────────────────────────────────────

    /**
     * Executa a migração completa do LocalStorage para o IndexedDB.
     * Só pode ser chamado após o backup ter sido baixado.
     */
    const handleMigrate = useCallback(async () => {
        if (!backupDownloaded) return

        setPhase("migrating")
        setError(null)

        try {
            const result = await migrateLocalStorageToIndexedDB()
            setMigrationResult(result)

            if (result.success) {
                setPhase("success")
                // Pequeno delay para UX: mostrar o estado de sucesso antes de liberar
                setTimeout(() => {
                    setGateRequired(false)
                    setReady(true)
                }, 1200)
            } else {
                setPhase("error")
                setError(result.error ?? "Erro desconhecido durante a migração.")
            }
        } catch (err) {
            setPhase("error")
            setError(`Erro inesperado: ${String(err)}`)
            setMigrationResult(null)
        }
    }, [backupDownloaded])

    // ── Handler: Forçar Pronto (Dev) ──────────────────────────────────────────

    /**
     * Força o app a entrar no estado "ready" sem executar a migração.
     * Usado apenas em desenvolvimento para pular o gate durante testes.
     */
    const handleForceReady = useCallback(() => {
        setGateRequired(false)
        setReady(true)
    }, [])

    return {
        ready,
        gateRequired,
        phase,
        backupDownloaded,
        migrationResult,
        error,
        handleDownloadBackup,
        handleCopyBackup,
        handleSkipBackup,
        handleMigrate,
        handleForceReady,
    }
}
