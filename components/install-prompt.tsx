"use client"

import { useState, useEffect } from "react"
import { X, Download, Share } from "lucide-react"
import { cn } from "@/lib/utils"

import { usePWA } from "@/hooks/use-pwa"

const DISMISSED_KEY = "valore-pwa-install-dismissed"

export function InstallPrompt() {
    const { isInstallable, isIOSDevice, isStandalone, promptInstall } = usePWA()
    const [showBanner, setShowBanner] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Se já está instalado ou já foi dispensado, não exibir
        if (isStandalone) return
        if (localStorage.getItem(DISMISSED_KEY)) return

        if (isInstallable) {
            const timer = setTimeout(() => {
                setShowBanner(true)
                setTimeout(() => setIsVisible(true), 50)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isStandalone, isInstallable])

    const handleInstall = async () => {
        const success = await promptInstall()
        if (success) {
            dismiss()
        }
    }

    const dismiss = () => {
        setIsVisible(false)
        setTimeout(() => setShowBanner(false), 300)
        localStorage.setItem(DISMISSED_KEY, "1")
    }

    if (!showBanner) return null

    return (
        <div
            className={cn(
                "fixed bottom-20 lg:bottom-6 left-0 right-0 mx-auto z-[70] max-w-md px-4",
                "transition-all duration-300 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
        >
            <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-4 shadow-2xl shadow-primary/10">
                <div className="flex items-start gap-3">
                    {/* Ícone do App */}
                    <div className="bg-primary/10 rounded-xl p-2.5 flex-shrink-0">
                        <img
                            src="/icons/icon-192.png"
                            alt="Valore"
                            className="w-10 h-10 rounded-lg"
                        />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm">Instalar o Valore</p>
                        {isIOSDevice ? (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Toque em{" "}
                                <span className="inline-flex items-center gap-0.5 text-primary font-medium">
                                    <Share className="h-3 w-3" />
                                    Compartilhar
                                </span>{" "}
                                e depois em{" "}
                                <span className="text-primary font-medium">"Adicionar à Tela de Início"</span>.
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Acesso rápido pelo celular, sem abrir o browser.
                            </p>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!isIOSDevice && (
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl min-h-[44px] hover:bg-primary/90 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Instalar
                            </button>
                        )}
                        <button
                            onClick={dismiss}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-muted"
                            aria-label="Dispensar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
