"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, CreditCard as CardIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreditCard } from "@/lib/types"

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
    <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 relative overflow-hidden border border-white/20 shadow-inner">
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
    <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60 fill-current" xmlns="http://www.w3.org/2000/svg">
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
    getBankById: (id: number) => any
    formatCurrency: (val: number) => string
    getCardAvailableLimit: (card: CreditCard) => number
}

export function CreditCardStack({
    creditCards,
    onEditCard,
    onDeleteCard,
    onAddExpense,
    getBankById,
    formatCurrency,
    getCardAvailableLimit
}: CreditCardStackProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creditCards.map((card) => {
                const bank = card.bankId ? getBankById(card.bankId) : null
                const available = getCardAvailableLimit(card)
                const limitUsage = ((card.limit - available) / card.limit) * 100

                return (
                    <Card key={card.id} className="relative group overflow-hidden border-0 bg-transparent shadow-none">
                        <div className={cn(
                            "w-full aspect-[1.586/1] rounded-[24px] p-6 text-white relative flex flex-col justify-between shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br",
                            getColorClass(card.color)
                        )}>
                            {/* Texture overlay */}
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80 leading-tight">Cartão de Crédito</span>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase">{card.name}</h3>
                                    {bank && (
                                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full w-fit backdrop-blur-md font-bold mt-1">
                                            {bank.name}
                                        </span>
                                    )}
                                </div>
                                <CardIcon className="h-8 w-8 opacity-40 rotate-12" />
                            </div>

                            <div className="flex justify-between items-center relative z-10">
                                <CardChip />
                                <ContactlessIcon />
                            </div>

                            <div className="relative z-10">
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Limite Disponível</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black italic tracking-tighter">{formatCurrency(available)}</span>
                                    <span className="text-xs opacity-60 font-medium">de {formatCurrency(card.limit)}</span>
                                </div>
                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-1000 bg-white/80 rounded-full")}
                                        style={{ width: `${Math.min(limitUsage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-4 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent flex gap-2 justify-center backdrop-blur-[2px] z-20">
                                <Button
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onAddExpense(card.id); }}
                                    className="bg-white text-black hover:bg-white/90 text-[10px] font-bold h-8 rounded-full shadow-lg"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Despesa
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); onEditCard(card); }}
                                    className="text-white hover:bg-white/20 text-[10px] font-bold h-8 rounded-full border border-white/20"
                                >
                                    <Pencil className="w-3 h-3 mr-1" /> Editar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }}
                                    className="text-white hover:bg-white/20 text-[10px] font-bold h-8 rounded-full border border-white/20"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                                </Button>
                            </div>
                        </div>
                    </Card>
                )
            })}

            <button
                onClick={() => onAddExpense(0)}
                className="group relative w-full aspect-[1.586/1] rounded-[24px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
            >
                <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Novo Cartão</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Conectar Instituição</p>
                </div>
            </button>
        </div>
    )
}
