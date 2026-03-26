"use client"

import { usePathname } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { OnboardingWizard } from "./onboarding-wizard"

export function OnboardingWrapper() {
    const { settings } = useApp()
    const pathname = usePathname()

    // Ocultar wrapper na Landing Page
    if (pathname === "/") {
        return null
    }

    // Se o onboarding não foi completado, mostra o Wizard
    if (!settings.onboardingCompleted) {
        return <OnboardingWizard />
    }

    return null
}
