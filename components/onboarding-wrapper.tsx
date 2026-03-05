"use client"

import { useApp } from "@/contexts/app-context"
import { OnboardingWizard } from "./onboarding-wizard"
import { OnboardingCopilot } from "./onboarding-copilot"

export function OnboardingWrapper() {
    const { settings } = useApp()

    // Se o onboarding não foi completado, mostra o Wizard
    if (!settings.onboardingCompleted) {
        return <OnboardingWizard />
    }

    // Se o onboarding foi completado e o guia deve ser mostrado, mostra o Copilot
    if (settings.showGuide) {
        return <OnboardingCopilot />
    }

    return null
}
