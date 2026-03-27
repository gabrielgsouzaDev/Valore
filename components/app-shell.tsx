"use client"

import type React from "react"
import { useApp } from "@/contexts/app-context"
import { InstallPrompt } from "@/components/install-prompt"
import { OnboardingWrapper } from "@/components/onboarding-wrapper"
import { ModuleGuide } from "@/components/module-guide"
import { LoadingScreen } from "@/components/loading-screen"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useApp()
    const pathname = usePathname()

    if (!isLoaded) {
        return <LoadingScreen />
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 flex flex-col"
            >
                {children}
                <OnboardingWrapper />
                <ModuleGuide />
                <InstallPrompt />
            </motion.div>
        </AnimatePresence>
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
