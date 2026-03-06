"use client"

import type React from "react"
import { AppProvider, useApp } from "@/contexts/app-context"
import { InstallPrompt } from "@/components/install-prompt"
import { OnboardingWrapper } from "@/components/onboarding-wrapper"
import { LoadingScreen } from "@/components/loading-screen"

/**
 * AppContent - Componente intermediário para acessar o contexto useApp
 * e gerenciar a exibição da tela de carregamento.
 */
function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useApp()

    // Garantimos que a tela de carregamento só suma quando o sistema estiver 100% pronto
    if (!isLoaded) {
        return <LoadingScreen />
    }

    return <>{children}</>
}

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <AppProvider>
            <AppContent>
                {children}
            </AppContent>
            <OnboardingWrapper />
            <InstallPrompt />
        </AppProvider>
    )
}
