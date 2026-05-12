"use client"

import { useState, useEffect, useMemo } from "react"
import { Calculator, TrendingUp, Receipt } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * Formata um valor em BRL de forma segura:
 * - Valores inválidos (NaN/Infinity) viram "—" (nunca estouram).
 * - Valores gigantes são abreviados (mi/bi/tri) para caber no card.
 */
function fmtBRL(v: number): string {
    if (!Number.isFinite(v)) return "—"
    const abs = Math.abs(v)
    const sign = v < 0 ? "-" : ""
    // Teto: acima de ~1 quatrilhão não faz sentido pra finanças — capa pra nunca vazar.
    if (abs >= 1e15) return `${sign}R$ 999+ tri`
    if (abs >= 1e12) return `${sign}R$ ${(abs / 1e12).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} tri`
    if (abs >= 1e9) return `${sign}R$ ${(abs / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} bi`
    if (abs >= 1e7) return `${sign}R$ ${(abs / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}

export function CalculatorWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"basic" | "juros" | "parcelas">("basic")

    // ── Calculadora Básica ──────────────────────────────────────────────────────
    const [basicDisplay, setBasicDisplay] = useState("0")
    const [basicEquation, setBasicEquation] = useState("")
    const [shouldReset, setShouldReset] = useState(false)

    const handleBasicNumber = (num: string) => {
        if (basicDisplay === "0" || basicDisplay === "Erro" || shouldReset) {
            setBasicDisplay(num)
            setShouldReset(false)
        } else if (basicDisplay.length < 15) {
            setBasicDisplay(basicDisplay + num)
        }
    }

    const handleBasicOperator = (op: string) => {
        if (basicDisplay === "Erro") return
        setBasicEquation(basicDisplay + " " + op + " ")
        setShouldReset(true)
    }

    const handleBasicEqual = () => {
        try {
            const expr = (basicEquation + basicDisplay).replace(/[^-()\d/*+.]/g, "")
            const result = Function('"use strict";return (' + expr + ")")()
            if (!Number.isFinite(result)) {
                setBasicDisplay("Erro")
            } else {
                // arredonda para no máx. 8 casas e remove zeros à toa
                setBasicDisplay(String(Number(result.toFixed(8))))
            }
            setBasicEquation("")
            setShouldReset(true)
        } catch {
            setBasicDisplay("Erro")
            setBasicEquation("")
            setShouldReset(true)
        }
    }

    const handleBasicClear = () => {
        setBasicDisplay("0")
        setBasicEquation("")
    }

    const handleBasicPercent = () => {
        const v = Number(basicDisplay)
        if (Number.isFinite(v)) setBasicDisplay(String(v / 100))
    }

    // fonte encolhe conforme o número cresce → nunca vaza do display
    const basicFontClass = basicDisplay.length > 12 ? "text-2xl" : basicDisplay.length > 9 ? "text-3xl" : "text-4xl"

    // ── Juros (Simples / Composto) ──────────────────────────────────────────────
    const [jurosMode, setJurosMode] = useState<"composto" | "simples">("composto")
    const [compPrincipal, setCompPrincipal] = useState("0")
    const [compMonthly, setCompMonthly] = useState("500")
    const [compRate, setCompRate] = useState("10")
    const [compYears, setCompYears] = useState("10")

    const compTotalInvested = (Number(compPrincipal) || 0) + ((Number(compMonthly) || 0) * (Number(compYears) || 0) * 12)

    const compFinalValue = useMemo(() => {
        const p = Number(compPrincipal) || 0
        const m = Number(compMonthly) || 0
        const rAnnual = (Number(compRate) || 0) / 100
        const y = Number(compYears) || 0
        const months = Math.round(y * 12)
        if (months <= 0) return p

        if (jurosMode === "simples") {
            // Juros simples (lineares): o principal rende sobre o valor inicial,
            // e cada aporte rende linearmente pelo tempo que ficou aplicado.
            const monthlyRate = rAnnual / 12
            const principalFV = p * (1 + rAnnual * y)
            const contribBase = m * months
            const contribInterest = m * monthlyRate * (months * (months - 1) / 2)
            return principalFV + contribBase + contribInterest
        }

        // Juros compostos (juros sobre juros).
        const monthlyRate = Math.pow(1 + rAnnual, 1 / 12) - 1
        if (monthlyRate === 0) return p + m * months
        return p * Math.pow(1 + monthlyRate, months) + m * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    }, [compPrincipal, compMonthly, compRate, compYears, jurosMode])

    const compTotalInterest = compFinalValue - compTotalInvested

    // ── Parcelas (financiamento com juros — Tabela Price) ───────────────────────
    const [loanPrincipal, setLoanPrincipal] = useState("5000")
    const [loanRate, setLoanRate] = useState("2")
    const [loanMonths, setLoanMonths] = useState("12")

    const { loanPayment, loanTotal } = useMemo(() => {
        const p = Number(loanPrincipal) || 0
        const r = (Number(loanRate) || 0) / 100
        const n = Math.round(Number(loanMonths) || 0)
        if (n <= 0) return { loanPayment: 0, loanTotal: p }
        if (r === 0) return { loanPayment: p / n, loanTotal: p }
        const payment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        return { loanPayment: payment, loanTotal: payment * n }
    }, [loanPrincipal, loanRate, loanMonths])

    const loanTotalInterest = loanTotal - (Number(loanPrincipal) || 0)

    // ── Atalhos de teclado ──────────────────────────────────────────────────────
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    useEffect(() => {
        const handleOpen = () => setIsOpen(true)
        document.addEventListener("open-calculator", handleOpen)
        return () => document.removeEventListener("open-calculator", handleOpen)
    }, [])

    const inputClass = "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    const labelClass = "text-[10px] uppercase font-bold text-muted-foreground"

    const tabs = [
        { id: "basic" as const, label: "Básica", icon: Calculator },
        { id: "juros" as const, label: "Juros", icon: TrendingUp },
        { id: "parcelas" as const, label: "Parcelas", icon: Receipt },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="
                sm:max-w-[425px] md:max-w-[480px] bg-card border-border p-0 gap-0 overflow-hidden shadow-2xl
                fixed bottom-0 top-auto sm:top-[50%] translate-y-0 sm:translate-y-[-50%]
                rounded-t-2xl sm:rounded-2xl transition-all duration-300
            ">
                <div className="bg-primary/5 border-b border-border/50 p-4 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <DialogTitle className="flex items-center gap-2 text-primary font-display uppercase tracking-wide font-bold">
                            <Calculator className="h-5 w-5" />
                            Calculadora
                        </DialogTitle>
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>

                    <div className="w-full">
                        <div className="w-full h-9 p-0.5 grid grid-cols-3 bg-muted rounded-t-lg">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "text-[10px] uppercase font-bold tracking-wider rounded-md h-8 flex items-center justify-center transition-all",
                                            activeTab === tab.id ? "bg-background text-primary shadow-sm" : "hover:text-primary/70 text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5 mr-1.5" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="bg-background px-4 sm:px-6 pt-4 pb-10 min-h-[400px] overflow-hidden">
                            {/* ── BÁSICA ─────────────────────────────────────────── */}
                            {activeTab === "basic" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-muted/30 rounded-xl p-4 text-right overflow-hidden border border-border/50 mb-2">
                                        <div className="text-[10px] font-bold text-muted-foreground h-4 tracking-wider uppercase truncate">{basicEquation}</div>
                                        <div className={cn("font-black text-foreground truncate h-12 leading-none flex items-end justify-end", basicFontClass)}>{basicDisplay}</div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={handleBasicClear} className="h-12 rounded-lg bg-muted/50 hover:bg-danger/10 hover:text-danger font-black text-sm transition-colors uppercase">AC</button>
                                        <button onClick={() => { const v = Number(basicDisplay); if (Number.isFinite(v)) setBasicDisplay(String(-v)) }} className="h-12 rounded-lg bg-muted/50 hover:bg-muted font-bold text-lg transition-colors">+/−</button>
                                        <button onClick={handleBasicPercent} className="h-12 rounded-lg bg-muted/50 hover:bg-muted font-bold text-lg transition-colors">%</button>
                                        <button onClick={() => handleBasicOperator("/")} className="h-12 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-black text-lg transition-colors">÷</button>

                                        {[7, 8, 9].map(n => <button key={n} onClick={() => handleBasicNumber(String(n))} className="h-12 rounded-lg bg-background border border-border/30 hover:border-primary/30 hover:bg-primary/5 font-black text-lg shadow-sm">{n}</button>)}
                                        <button onClick={() => handleBasicOperator("*")} className="h-12 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-black text-lg transition-colors">×</button>

                                        {[4, 5, 6].map(n => <button key={n} onClick={() => handleBasicNumber(String(n))} className="h-12 rounded-lg bg-background border border-border/30 hover:border-primary/30 hover:bg-primary/5 font-black text-lg shadow-sm">{n}</button>)}
                                        <button onClick={() => handleBasicOperator("-")} className="h-12 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-black text-lg transition-colors">−</button>

                                        {[1, 2, 3].map(n => <button key={n} onClick={() => handleBasicNumber(String(n))} className="h-12 rounded-lg bg-background border border-border/30 hover:border-primary/30 hover:bg-primary/5 font-black text-lg shadow-sm">{n}</button>)}
                                        <button onClick={() => handleBasicOperator("+")} className="h-12 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-black text-lg transition-colors">+</button>

                                        <button onClick={() => handleBasicNumber("0")} className="h-12 col-span-2 rounded-lg bg-background border border-border/30 hover:border-primary/30 hover:bg-primary/5 font-black text-lg shadow-sm">0</button>
                                        <button onClick={() => { if (!basicDisplay.includes(".")) handleBasicNumber(".") }} className="h-12 rounded-lg bg-background border border-border/30 font-black text-lg shadow-sm">,</button>
                                        <button onClick={handleBasicEqual} className="h-12 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-black text-lg shadow-lg active:scale-95 transition-all">=</button>
                                    </div>
                                </div>
                            )}

                            {/* ── JUROS (simples / composto) ─────────────────────── */}
                            {activeTab === "juros" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Toggle simples / composto */}
                                    <div className="grid grid-cols-2 gap-0.5 p-0.5 bg-muted rounded-lg">
                                        {(["composto", "simples"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setJurosMode(mode)}
                                                className={cn(
                                                    "h-8 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all",
                                                    jurosMode === mode ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-primary/70"
                                                )}
                                            >
                                                {mode === "composto" ? "Composto" : "Simples"}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center -mt-1">
                                        {jurosMode === "composto"
                                            ? "Juros sobre juros — como rende um investimento."
                                            : "Juros lineares — sempre sobre o valor inicial."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Valor inicial (R$)</label>
                                            <input type="number" value={compPrincipal} onChange={e => setCompPrincipal(e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Guardando por mês (R$)</label>
                                            <input type="number" value={compMonthly} onChange={e => setCompMonthly(e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Rendimento ao ano (%)</label>
                                            <input type="number" step="0.1" value={compRate} onChange={e => setCompRate(e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Por quantos anos</label>
                                            <input type="number" value={compYears} onChange={e => setCompYears(e.target.value)} className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center mt-6">
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">Você terá</p>
                                        <p className="font-mono text-2xl sm:text-3xl font-black text-primary tracking-tight mb-4 truncate">
                                            {fmtBRL(compFinalValue)}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-left pt-3 border-t border-border/50">
                                            <div className="min-w-0">
                                                <p className={labelClass}>Total guardado</p>
                                                <p className="font-mono text-sm font-bold text-foreground truncate">{fmtBRL(compTotalInvested)}</p>
                                            </div>
                                            <div className="text-right min-w-0">
                                                <p className="text-[10px] uppercase font-bold text-success">Rendimento</p>
                                                <p className="font-mono text-sm font-black text-success truncate">+{fmtBRL(compTotalInterest)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── PARCELAS (com juros) ───────────────────────────── */}
                            {activeTab === "parcelas" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5 col-span-2">
                                            <label className={labelClass}>Valor a parcelar (R$)</label>
                                            <input type="number" value={loanPrincipal} onChange={e => setLoanPrincipal(e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Juros ao mês (%)</label>
                                            <input type="number" step="0.1" value={loanRate} onChange={e => setLoanRate(e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Nº de parcelas</label>
                                            <input type="number" value={loanMonths} onChange={e => setLoanMonths(e.target.value)} className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 text-center mt-6">
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-1">Cada parcela</p>
                                        <p className="font-mono text-2xl sm:text-3xl font-black text-danger tracking-tight mb-4 truncate">
                                            {fmtBRL(loanPayment)}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-left pt-3 border-t border-danger/20">
                                            <div className="min-w-0">
                                                <p className={labelClass}>Total a pagar</p>
                                                <p className="font-mono text-sm font-bold text-foreground truncate">{fmtBRL(loanTotal)}</p>
                                            </div>
                                            <div className="text-right min-w-0">
                                                <p className="text-[10px] uppercase font-bold text-danger">Juros totais</p>
                                                <p className="font-mono text-sm font-black text-danger truncate">+{fmtBRL(loanTotalInterest)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
