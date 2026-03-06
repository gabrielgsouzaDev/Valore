"use client"

import { useEffect, useState } from "react"

/**
 * LoadingScreen - Tela de carregamento premium para o sistema Valore.
 * Exibe o logo tipográfico com animação de fade-in e indicadores pulsantes.
 */
export function LoadingScreen() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-colors duration-300">
            <div className="flex flex-col items-center gap-8 text-center px-6">
                {/* Logo Tipográfico com fade-in */}
                <div className="flex flex-col items-center animate-in fade-in duration-700 ease-out">
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-primary tracking-tighter animate-in fade-in zoom-in-95 duration-400">
                        Valore
                    </h1>
                    <div
                        className="h-1 w-12 bg-primary/20 rounded-full mt-2 animate-in slide-in-from-left duration-1000"
                    />
                </div>

                {/* Indicadores pulsantes */}
                <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse [animation-duration:1500ms]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse [animation-duration:1500ms] [animation-delay:200ms]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse [animation-duration:1500ms] [animation-delay:400ms]" />
                </div>
            </div>
        </div>
    )
}
