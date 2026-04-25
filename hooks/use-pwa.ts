"use client"

import { useState, useEffect, useCallback } from "react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
    interface Window {
        MSStream?: unknown
    }
}

interface NavStandalone extends Navigator {
    standalone?: boolean
}

export function usePWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isIOSDevice, setIsIOSDevice] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    const checkStandalone = useCallback(() => {
        if (typeof window === "undefined") return false
        return (
            (window.navigator as NavStandalone).standalone === true ||
            window.matchMedia("(display-mode: standalone)").matches
        )
    }, [])

    const checkIOS = useCallback(() => {
        if (typeof window === "undefined") return false
        return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream
    }, [])

    useEffect(() => {
        const standalone = checkStandalone()
        const ios = checkIOS()

        setIsStandalone(standalone)
        setIsIOSDevice(ios)

        if (standalone) return

        if (ios) {
            setIsInstallable(true)
            return
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
    }, [checkStandalone, checkIOS])

    const promptInstall = async () => {
        if (!deferredPrompt) return false

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === "accepted") {
            setDeferredPrompt(null)
            setIsInstallable(false)
            return true
        }

        return false
    }

    return {
        isInstallable,
        isIOSDevice,
        isStandalone,
        promptInstall,
    }
}
