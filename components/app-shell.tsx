"use client"

import type React from "react"
import { AppProvider, useApp } from "@/contexts/app-context"
import { InstallPrompt } from "@/components/install-prompt"
import { OnboardingWrapper } from "@/components/onboarding-wrapper"
import { LoadingScreen } from "@/components/loading-screen"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

/**
 * AppContent - Componente intermediário para acessar o contexto useApp
 * e gerenciar a exibição da tela de carregamento.
 */
function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useApp()

    if (!isLoaded) {
        return <LoadingScreen />
    }

    return <>{children}</>
}

/**
 * AppShell - Shell client-side que envolve toda a aplicação com
 * AppProvider, LoadingScreen, OnboardingWrapper e InstallPrompt.
 * Extraído como componente separado porque o root layout precisa
 * permanecer Server Component para exportar metadata/viewport.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <AppContent>
                {children}
            </AppContent>
            <OnboardingWrapper />
            <InstallPrompt />
            <Toaster />
            <Analytics />
        </AppProvider>
    )
}
