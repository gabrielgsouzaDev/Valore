"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Database, AlertTriangle, ShieldCheck, ArrowRight, Loader2, Download, CheckCircle2 } from "lucide-react"
import type { MigrationResult } from "@/lib/migration"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UpdateGateModalProps {
    /** Fase atual do processo sincronizada pelo hook useUpdateGate. */
    phase: "idle" | "downloading" | "migrating" | "success" | "error"
    /** Se o backup já foi baixado (habilita migração). */
    backupDownloaded: boolean
    /** Resultado detalhado (opcional). */
    migrationResult: MigrationResult | null
    /** Mensagem de erro. */
    error: string | null
    /** Handlers injetados pelo orchestrator. */
    handleDownloadBackup: () => void
    handleCopyBackup: () => Promise<boolean>
    handleSkipBackup: () => void
    handleMigrate: () => Promise<void>
    handleForceReady: () => void
}

/**
 * UpdateGateModal (UI Refatorada)
 * 
 * Componente visual que bloqueia a aplicação durante a migração para IndexedDB.
 * Agora integrado ao hook useUpdateGate para orquestração de estado.
 */
export function UpdateGateModal({
    phase,
    backupDownloaded,
    error,
    handleDownloadBackup,
    handleCopyBackup,
    handleSkipBackup,
    handleMigrate,
}: UpdateGateModalProps) {

    // Mapeamento de progresso visual baseado na fase (fix UX)
    const progressMap = {
        idle: 0,
        downloading: 30,
        migrating: 60,
        success: 100,
        error: 0
    }

    const isWorking = phase === "downloading" || phase === "migrating"

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <Card className="max-w-md w-full bg-card border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
                <div className="bg-primary/10 p-6 border-b border-primary/20 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 animate-pulse">
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">
                            Atualização Crítica
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Migração de Dados v3.0</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {phase !== "success" ? (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm text-foreground/80 leading-relaxed font-bold">
                                            Segurança em Primeiro Lugar
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Antes de mover seus dados para o novo motor IndexedDB, precisamos
                                            que você garanta um backup de segurança.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <StepItem
                                        icon={<Download className="h-3.5 w-3.5" />}
                                        label="1. Baixar backup de segurança"
                                        completed={backupDownloaded}
                                        active={phase === "downloading"}
                                    />
                                    <StepItem
                                        icon={<Database className="h-3.5 w-3.5" />}
                                        label="2. Migrar banco de dados"
                                        completed={(phase as string) === "success"}
                                        active={phase === "migrating"}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3 mt-4">
                                {!backupDownloaded ? (
                                    <Button
                                        onClick={handleDownloadBackup}
                                        disabled={isWorking}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase h-12 rounded-xl"
                                    >
                                        {phase === "downloading" ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="mr-2 h-4 w-4" />
                                        )}
                                        Baixar Arquivo de Backup
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleMigrate}
                                        disabled={isWorking}
                                        className="w-full bg-success hover:bg-success/90 text-success-foreground font-black uppercase h-12 rounded-xl group transition-all"
                                    >
                                        {phase === "migrating" ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        )}
                                        Migrar Agora
                                    </Button>
                                )}

                                {!backupDownloaded && (
                                    <Button
                                        variant="outline"
                                        onClick={handleCopyBackup}
                                        disabled={isWorking}
                                        className="w-full border-primary/20 hover:bg-primary/5 text-primary text-[10px] uppercase font-bold h-10 rounded-xl"
                                    >
                                        Copiar backup como texto (Opção Mobile)
                                    </Button>
                                )}
                            </div>

                            {!backupDownloaded && (
                                <div className="text-center">
                                    <button
                                        onClick={handleSkipBackup}
                                        disabled={isWorking}
                                        className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors uppercase font-bold"
                                    >
                                        Avançar sem backup (Não recomendado)
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-8 space-y-6 text-center animate-in fade-in zoom-in duration-500">
                            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-black uppercase tracking-widest text-foreground">
                                    Migração Concluída!
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Sua conta foi atualizada para o novo motor de performance.
                                    A aplicação será reiniciada em instantes.
                                </p>
                            </div>

                            <Progress value={100} className="h-2 bg-muted rounded-full overflow-hidden" />
                        </div>
                    )}
                </div>

                {isWorking && (
                    <div className="px-6 pb-6">
                        <Progress value={progressMap[phase]} className="h-1 bg-muted rounded-full overflow-hidden" />
                    </div>
                )}

                <div className="bg-muted/50 p-4 border-t border-border/50">
                    <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-[0.2em]">
                        Valore Architecture Protocol — v3.0.0
                    </p>
                </div>
            </Card>
        </div>
    )
}

function StepItem({ icon, label, completed, active }: { icon: ReactNode; label: string; completed: boolean; active: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${completed ? "bg-success/5 border-success/20 opacity-60" :
            active ? "bg-primary/5 border-primary/20 scale-[1.02]" : "bg-card border-border"
            }`}>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${completed ? "bg-success text-success-foreground" :
                active ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"
                }`}>
                {completed ? <CheckCircle2 className="h-4 w-4" /> : icon}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-tight ${completed ? "text-success" : active ? "text-primary" : "text-muted-foreground"
                }`}>
                {label}
            </span>
        </div>
    )
}
