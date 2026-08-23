"use client"

import { useEffect, useState } from "react"

/**
 * LoadingScreen — tela de carregamento do Valore.
 *
 * Sem wordmark: um gráfico de mercado "vivo" (barras respirando em onda) sobre
 * um glow radial que herda a cor do tema, uma linha-base de ledger e uma barra
 * de progresso indeterminada. Usa apenas variáveis de tema, então fica coerente
 * nos 33 temas (claros e escuros).
 */

// Alturas relativas — desenham a silhueta de um gráfico, não um equalizador uniforme.
const BARS = [0.42, 0.66, 0.5, 0.88, 0.64, 1, 0.54]

/**
 * Recarrega do zero: desregistra service workers e limpa os caches antes do
 * reload. Resolve o caso em que um SW antigo (de um build anterior) serve
 * assets desatualizados e prende o app na tela de carregamento.
 */
async function hardReload() {
    try {
        if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations()
            await Promise.all(regs.map((r) => r.unregister()))
        }
        if ("caches" in window) {
            const keys = await caches.keys()
            await Promise.all(keys.map((k) => caches.delete(k)))
        }
    } catch {
        // segue para o reload de qualquer forma
    }
    window.location.reload()
}

export function LoadingScreen({ slow = false }: { slow?: boolean }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background">
            {/* Atmosfera: glow radial na cor do tema (nada de fundo chapado) */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(55% 45% at 50% 50%, rgb(var(--theme-primary) / 0.12), transparent 70%)" }}
            />

            <div className="relative flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-700 ease-out">
                {/* Gráfico vivo */}
                <div className="flex h-16 items-end gap-[7px]">
                    {BARS.map((h, i) => (
                        <div
                            key={i}
                            className="w-[7px] origin-bottom rounded-full bg-primary"
                            style={{
                                height: `${h * 100}%`,
                                // profundidade: barras mais altas = mais opacas
                                opacity: 0.4 + h * 0.55,
                                animation: `valore-bar 1.5s cubic-bezier(0.45, 0, 0.55, 1) ${i * 0.11}s infinite`,
                            }}
                        />
                    ))}
                </div>

                {/* Linha-base do ledger */}
                <div className="h-px w-40 bg-border" />

                {/* Progresso indeterminado */}
                <div className="relative h-[3px] w-28 overflow-hidden rounded-full bg-muted/60">
                    <div
                        className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary"
                        style={{ animation: "valore-progress 1.3s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
                    />
                </div>

                {/* Saída de emergência: só após o timeout (ver AppShell) */}
                {slow && (
                    <div className="mt-2 flex flex-col items-center gap-2 animate-in fade-in duration-500">
                        <p className="text-xs text-muted-foreground">Está demorando mais que o normal.</p>
                        <button
                            onClick={hardReload}
                            className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                        >
                            Recarregar
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
