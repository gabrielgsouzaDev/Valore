"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { InstallPrompt } from "@/components/install-prompt"
import { ModuleGuide } from "@/components/module-guide"
import { LoadingScreen } from "@/components/loading-screen"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useApp()
    const pathname = usePathname()

    // Rede de segurança contra "load infinito": se o banco não terminar de
    // abrir em ~8s (ex.: service worker servindo assets velhos, ou IndexedDB
    // travado), a LoadingScreen oferece um "Recarregar" que limpa SW + caches.
    const [slowLoad, setSlowLoad] = useState(false)
    useEffect(() => {
        if (isLoaded) { setSlowLoad(false); return }
        const t = setTimeout(() => setSlowLoad(true), 8000)
        return () => clearTimeout(t)
    }, [isLoaded])

    if (!isLoaded) {
        return <LoadingScreen slow={slowLoad} />
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Sidebar />
            <main className="lg:ml-[var(--sidebar-w)] transition-[margin] duration-300 pb-20 lg:pb-0 min-h-screen flex flex-col">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="flex-1 flex flex-col"
                    >
                        {children}
                        <ModuleGuide />
                        <InstallPrompt />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppContent>
                {children}
            </AppContent>
            <Toaster />
        </>
    )
}
