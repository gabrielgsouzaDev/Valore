"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { AppProvider } from "@/contexts/app-context"
import { ThemeProvider } from "./theme-provider"
import { STORAGE_KEY } from "@/lib/constants"
import { AnimatePresence } from "framer-motion"

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

export function Providers({ children }: { children: ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: persister as any }}
        >
            <AppProvider>
                <ThemeProvider attribute="class" defaultTheme="paper" enableSystem>
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </ThemeProvider>
            </AppProvider>
        </PersistQueryClientProvider>
    )
}
