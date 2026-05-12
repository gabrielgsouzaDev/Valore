"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { AppProvider } from "@/contexts/app-context"
import { STORAGE_KEY } from "@/lib/constants"
import { useUpdateGate } from "@/hooks/useUpdateGate"
import { UpdateGateModal } from "@/components/UpdateGateModal"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
})

const persister = typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: `${STORAGE_KEY}-query-cache`,
    })
    : null

/**
 * Componente de Gate: exibido antes do AppProvider.
 * Bloqueia a UI se uma migração de schema for necessária.
 */
function UpdateGateGuard({ children }: { children: ReactNode }) {
    const {
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
    } = useUpdateGate()

    if (gateRequired && !ready) {
        return (
            <UpdateGateModal
                phase={phase}
                backupDownloaded={backupDownloaded}
                migrationResult={migrationResult}
                error={error}
                handleDownloadBackup={handleDownloadBackup}
                handleCopyBackup={handleCopyBackup}
                handleSkipBackup={handleSkipBackup}
                handleMigrate={handleMigrate}
                handleForceReady={handleForceReady}
            />
        )
    }

    if (!ready) {
        // Aguardando a verificação inicial de versão (< 100ms)
        return null
    }

    return <>{children}</>
}

/**
 * Providers raiz da aplicação.
 * A ordem é: QueryClient → UpdateGate → AppProvider → UI.
 * O UpdateGate garante que o AppProvider só inicie após a verificação de schema.
 *
 * NOTA: o tema é gerenciado inteiramente pelo sistema próprio (variáveis
 * `--theme-*` + classe `dark`, via applyThemeVariables/boot script em layout.tsx).
 * O antigo `next-themes` ThemeProvider foi removido porque, com `attribute="class"`,
 * ele reescrevia a className do <html> para o defaultTheme ("paper") após a
 * hidratação, apagando a classe `dark` aplicada pelos temas escuros.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: persister as any }}
        >
            <UpdateGateGuard>
                <AppProvider>
                    {children}
                </AppProvider>
            </UpdateGateGuard>
        </PersistQueryClientProvider>
    )
}
