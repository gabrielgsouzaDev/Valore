"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Wallet } from "lucide-react"
import { getEconomyBarColor, formatCurrency } from "@/lib/services"
import { cn } from "@/lib/utils"
import type { Category, Subcategory } from "@/lib/types"

interface CategoryListProps {
    categories: Category[]
    isPrivate: boolean
    onAddCategory: () => void
    onEditCategory: (category: Category) => void
    onDeleteCategory: (id: number) => void
    onAddSubcategory: (categoryId: number) => void
    onEditSubcategory: (categoryId: number, subcategory: Subcategory) => void
    onDeleteSubcategory: (categoryId: number, subcategoryId: number) => void
    onToggleCategory: (id: number) => void
}

export function CategoryList({
    categories,
    isPrivate,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    onAddSubcategory,
    onEditSubcategory,
    onDeleteSubcategory,
    onToggleCategory,
}: CategoryListProps) {
    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Categorias</h3>
                <Button
                    onClick={onAddCategory}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nova Categoria</span>
                    <span className="sm:hidden">Nova</span>
                </Button>
            </div>

            <div className="space-y-4">
                {categories.length === 0 ? (
                    <EmptyState
                        icon={Wallet}
                        title="Nenhuma categoria de orçamento"
                        description="Crie categorias como 'Moradia', 'Alimentação' e 'Lazer' para distribuir sua renda mensal e ter controle total dos seus gastos."
                        actionLabel="Criar Primeira Categoria"
                        onAction={onAddCategory}
                    />
                ) : (
                    <Card className="bg-card border-border overflow-hidden divide-y divide-border/50">
                        {categories.map((category) => (
                            <div key={category.id} className="transition-all hover:bg-muted/5">
                                <div className="p-4 sm:p-5 group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <button
                                                onClick={() => onToggleCategory(category.id)}
                                                className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                            >
                                                {category.expanded ? (
                                                    <ChevronDown className="h-5 w-5" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5" />
                                                )}
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-foreground text-sm sm:text-base uppercase tracking-tighter italic">
                                                        {category.name}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                                                        {category.percentage}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 max-w-[120px] bg-muted/50 rounded-full h-1 overflow-hidden">
                                                        <div
                                                            className="h-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.min((category.spent / (category.budgeted || 1)) * 100, 100)}%`,
                                                                backgroundColor: getEconomyBarColor(category.spent, category.budgeted)
                                                            }}
                                                        />
                                                    </div>
                                                    <span className={cn("text-[10px] font-bold", (category.spent / (category.budgeted || 1)) > 1 ? "text-danger" : "text-muted-foreground")}>
                                                        {((category.spent / (category.budgeted || 1)) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className={cn("font-black text-foreground text-sm sm:text-base tracking-tighter", isPrivate && "blur-md select-none")}>
                                                    {formatCurrency(category.spent)}
                                                </p>
                                                <p className={cn("text-[10px] font-bold text-muted-foreground uppercase tracking-widest", isPrivate && "blur-sm opacity-50")}>
                                                    de {formatCurrency(category.budgeted)}
                                                </p>
                                            </div>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button onClick={() => onEditCategory(category)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                                                <Button onClick={() => onDeleteCategory(category.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subcategories */}
                                    {category.expanded && (
                                        <div className="mt-4 ml-6 space-y-3 border-l-2 border-primary/10 pl-5 py-2 bg-primary/5 rounded-r-xl transition-all animate-in slide-in-from-top-2 duration-300">
                                            {category.subcategories?.map((sub) => (
                                                <div key={sub.id} className="relative group/sub">
                                                    <div className="flex items-center justify-between gap-4 py-1">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-foreground/70 tracking-tight">{sub.name}</p>
                                                                <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-tighter", sub.spent > sub.budgeted ? "bg-danger/10 text-danger" : "bg-success/10 text-success")}>
                                                                    {((sub.spent / (sub.budgeted || 1)) * 100).toFixed(0)}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full max-w-[150px] bg-muted/40 rounded-full h-1 mt-1.5 overflow-hidden">
                                                                <div
                                                                    className="h-full transition-all duration-700 ease-out"
                                                                    style={{
                                                                        width: `${Math.min((sub.spent / (sub.budgeted || 1)) * 100, 100)}%`,
                                                                        backgroundColor: getEconomyBarColor(sub.spent, sub.budgeted)
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className={cn("text-xs font-black tracking-tighter text-foreground/90 flex-shrink-0", isPrivate && "blur-sm opacity-40")}>
                                                                {formatCurrency(sub.spent)}
                                                            </p>
                                                            <div className="flex opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                                <Button onClick={() => onEditSubcategory(category.id, sub)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary"><Pencil className="h-3.5 w-3.5" /></Button>
                                                                <Button onClick={() => onDeleteSubcategory(category.id, sub.id)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2">
                                                <Button
                                                    onClick={() => onAddSubcategory(category.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 h-7 px-2 rounded-lg"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Card>
                )}
            </div>
        </div>
    )
}
