"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, CreditCard as CardIcon } from "lucide-react"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { cn } from "@/lib/utils"
import NumberTicker from "@/components/ui/number-ticker"
import type { CreditCard, Bank } from "@/lib/types"

const cardColors = [
    { value: "violet", label: "Roxo", class: "from-violet-600 to-violet-800" },
    { value: "orange", label: "Laranja", class: "from-orange-500 to-orange-700" },
    { value: "emerald", label: "Verde", class: "from-emerald-500 to-emerald-700" },
    { value: "blue", label: "Azul Marine", class: "from-blue-600 to-blue-900" },
    { value: "rose", label: "Rosa", class: "from-rose-500 to-rose-700" },
    { value: "cyan", label: "Ciano", class: "from-cyan-500 to-cyan-700" },
    { value: "amber", label: "Gold Premium", class: "from-amber-400 via-amber-600 to-amber-700" },
    { value: "slate", label: "Silver Metal", class: "from-slate-300 via-slate-500 to-slate-600" },
    { value: "zinc", label: "Obsidian Black", class: "from-zinc-800 via-zinc-900 to-black" },
    { value: "indigo", label: "Indigo Deep", class: "from-indigo-600 to-indigo-900" },
]

const CardChip = () => (
    <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 relative overflow-hidden border border-white/20 shadow-inner shrink-0">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-black/40" />
            ))}
        </div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/20" />
    </div>
)

const ContactlessIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.06 16.5a.5.5 0 01-.1-.7 7 7 0 010-9.6.5.5 0 11.7.7 6 6 0 000 8.2.5.5 0 01-.6.7zm2.47-1.41a.5.5 0 01-.06-.7 5 5 0 010-6.78.5.5 0 11.7.7 4 4 0 000 5.38.5.5 0 01-.64.7zm2.48-1.42a.5.5 0 01-.02-.7 3 3 0 010-3.94.5.5 0 11.71.7 2 2 0 000 2.54.5.5 0 01-.69.7zM15 12a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
)

const getColorClass = (color: string) => {
    return cardColors.find((c) => c.value === color)?.class || "from-slate-600 to-slate-800"
}

interface CreditCardStackProps {
    creditCards: CreditCard[]
    onEditCard: (card: CreditCard) => void
    onDeleteCard: (id: number) => void
    onAddExpense: (cardId: number) => void
    getBankById: (id: number) => Bank | undefined
    formatCurrency: (val: number) => string
    getCardAvailableLimit: (card: CreditCard) => number
    isPrivate: boolean
    isLoading?: boolean
}

export function CreditCardStack({
    creditCards,
    onEditCard,
    onDeleteCard,
    onAddExpense,
    getBankById,
    formatCurrency,
    getCardAvailableLimit,
    isPrivate,
    isLoading
}: CreditCardStackProps) {
    const [mobileActiveId, setMobileActiveId] = useState<number | null>(null)

    // Grid responsivo: cada cartão tem largura mínima garantida (>= ~300px),
    // então nunca fica pequeno demais a ponto de cortar informação.
    const gridClass = "grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-5"

    if (isLoading) {
        return (
            <div className={gridClass}>
                {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} variant="full" className="aspect-[1.586/1] rounded-2xl" />
                ))}
            </div>
        )
    }

    return (
        <div className={gridClass}>
            {creditCards.map((card) => {
                const bank = card.bankId ? getBankById(card.bankId) : null
                const available = getCardAvailableLimit(card)
                const limitUsage = card.limit > 0 ? ((card.limit - available) / card.limit) * 100 : 0
                const isActiveOnMobile = mobileActiveId === card.id

                return (
                    <div
                        key={card.id}
                        className="relative group aspect-[1.586/1] cursor-pointer lg:cursor-default"
                        onClick={() => setMobileActiveId(isActiveOnMobile ? null : card.id)}
                    >
                        <div className={cn(
                            "w-full h-full rounded-2xl p-4 sm:p-5 text-white relative flex flex-col justify-between shadow-xl transition-all duration-500 overflow-hidden bg-gradient-to-br",
                            getColorClass(card.color)
                        )}>
                            {/* Brilho self-contained (sem URL externa) */}
                            <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />

                            {/* Topo: identidade + bandeira */}
                            <div className="flex justify-between items-start gap-2 relative z-10 min-w-0">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <span className="text-[9px] uppercase font-black tracking-[0.2em] opacity-80 leading-none">Cartão de Crédito</span>
                                    <h3 className="text-base sm:text-lg font-black tracking-tight uppercase truncate leading-tight">{card.name}</h3>
                                    {bank && (
                                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full w-fit backdrop-blur-md font-bold max-w-full truncate">
                                            {bank.name}
                                        </span>
                                    )}
                                </div>
                                <CardIcon className="h-6 w-6 opacity-40 rotate-12 shrink-0" />
                            </div>

                            {/* Meio: chip + contactless */}
                            <div className="flex justify-between items-center relative z-10">
                                <CardChip />
                                <ContactlessIcon />
                            </div>

                            {/* Base: limite disponível */}
                            <div className="relative z-10">
                                <p className="text-[9px] uppercase font-bold tracking-widest opacity-60 mb-0.5">Limite Disponível</p>
                                <div className="flex items-baseline gap-1.5 min-w-0">
                                    <span className="font-mono text-lg sm:text-xl font-black tracking-tight text-white truncate">
                                        <NumberTicker value={available} currency isPrivate={isPrivate} />
                                    </span>
                                    <span className={cn("font-mono text-[10px] opacity-60 font-medium shrink-0", isPrivate && "blur-sm select-none")}>
                                        / {formatCurrency(card.limit)}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-black/20 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-white/80 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(limitUsage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Overlay de ações */}
                            <div className={cn(
                                "absolute inset-0 p-4 transition-all duration-300 bg-black/60 flex items-center justify-center gap-2 backdrop-blur-md z-20 rounded-2xl",
                                isActiveOnMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none lg:pointer-events-auto",
                                "lg:group-hover:opacity-100"
                            )}>
                                <Button
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onAddExpense(card.id); setMobileActiveId(null); }}
                                    className="bg-white text-black hover:bg-white/90 text-xs font-bold h-9 px-3 rounded-full shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Despesa
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); onEditCard(card); setMobileActiveId(null); }}
                                    className="text-white hover:bg-white/20 h-9 w-9 rounded-full border border-white/20"
                                    aria-label="Editar cartão"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); setMobileActiveId(null); }}
                                    className="text-white hover:bg-white/20 h-9 w-9 rounded-full border border-white/20"
                                    aria-label="Excluir cartão"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            })}

            <button
                onClick={() => onAddExpense(0)}
                className="group relative w-full aspect-[1.586/1] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
                <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Novo Cartão</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Conectar Instituição</p>
                </div>
            </button>
        </div>
    )
}
