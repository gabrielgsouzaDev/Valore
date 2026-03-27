"use client"

import { usePathname } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { OnboardingWizard } from "./onboarding-wizard"

export function OnboardingWrapper() {
    const { settings } = useApp()
    // O Wizard será exibido em qualquer rota que não tenha sido completada

    // Se o onboarding não foi completado, mostra o Wizard
    if (!settings.onboardingCompleted) {
        return <OnboardingWizard />
    }

    return null
}
