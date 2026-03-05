import type React from "react"
import { AppProvider } from "@/contexts/app-context"
import { InstallPrompt } from "@/components/install-prompt"
import { OnboardingWrapper } from "@/components/onboarding-wrapper"

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <AppProvider>
            {children}
            <OnboardingWrapper />
            <InstallPrompt />
        </AppProvider>
    )
}
