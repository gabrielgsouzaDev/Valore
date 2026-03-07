"use client"

import { useState } from "react"
import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DemoBanner() {
    const { settings, clearAllData } = useApp()
    const [confirmOpen, setConfirmOpen] = useState(false)

    if (!settings.isDemoMode) return null

    const handleClearData = () => {
        clearAllData()
        setConfirmOpen(false)
    }

    return (
        <>
            <div className="w-full bg-warning/15 border-b border-warning/30 py-2.5 px-4 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-warning">
                    <FlaskConical className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-medium sm:text-sm">
                        <span className="inline sm:hidden">Modo Demo</span>
                        <span className="hidden sm:inline">Modo Demo ativo — estes são dados fictícios para exploração</span>
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs sm:h-8 border-warning/50 text-warning hover:bg-warning/20 bg-transparent"
                    onClick={() => setConfirmOpen(true)}
                >
                    <span className="inline sm:hidden">Limpar</span>
                    <span className="hidden sm:inline">Usar meus dados</span>
                </Button>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Sair do Modo Demo"
                description="Deseja limpar os dados fictícios e iniciar um novo perfil para inserir seus próprios dados?"
                variant="default"
                confirmLabel="Sim, limpar dados"
                onConfirm={handleClearData}
            />
        </>
    )
}
