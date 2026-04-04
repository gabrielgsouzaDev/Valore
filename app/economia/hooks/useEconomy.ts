"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { Category, Subcategory } from "@/lib/types"

/**
 * Hook customizado para centralizar a lógica de negócio do módulo de Economia.
 * Gerencia o estado de modais, handlers de CRUD para categorias/subcategorias
 * e deriva dados de saldo e orçamento.
 */
export function useEconomy() {
    const {
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        toggleCategory,
        settings,
        totalBudgeted,
        totalSpent,
    } = useApp()
    const { toast } = useToast()

    // ── Estado de UI ──────────────────────────────────────────────────────────

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false)
    const [editingSubcategory, setEditingSubcategory] = useState<{
        categoryId: number
        subcategory: Subcategory | null
    } | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{
        type: "category"; id: number
    } | {
        type: "subcategory"; categoryId: number; id: number
    } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ── Dados Derivados ───────────────────────────────────────────────────────

    const remaining = totalBudgeted - totalSpent
    const fixedExpensesTotal = categories.find((c) => c.name === "Moradia")?.spent || 0
    const fixedExpenses = categories.find((c) => c.name === "Moradia")?.subcategories || []

    // ── Handlers de Categoria ─────────────────────────────────────────────────

    const openAddCategoryDialog = () => {
        setEditingCategory(null)
        setCategoryDialogOpen(true)
    }

    const openEditCategoryDialog = (category: Category) => {
        setEditingCategory(category)
        setCategoryDialogOpen(true)
    }

    const handleSaveCategory = (data: { name: string; percentage: number; budgeted: number; color: string }) => {
        setIsSubmitting(true)
        try {
            if (editingCategory) {
                updateCategory(editingCategory.id, data)
                toast({ title: "Categoria atualizada" })
            } else {
                addCategory(data)
                toast({ title: "Categoria adicionada" })
            }
            setCategoryDialogOpen(false)
            setEditingCategory(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCategory = (id: number) => {
        setDeleteTarget({ type: "category", id })
        setConfirmOpen(true)
    }

    // ── Handlers de Subcategoria ──────────────────────────────────────────────

    const openAddSubcategoryDialog = (categoryId: number) => {
        setEditingSubcategory({ categoryId, subcategory: null })
        setSubcategoryDialogOpen(true)
    }

    const openEditSubcategoryDialog = (categoryId: number, subcategory: Subcategory) => {
        setEditingSubcategory({ categoryId, subcategory })
        setSubcategoryDialogOpen(true)
    }

    const handleSaveSubcategory = (data: Omit<Subcategory, "id" | "spent">) => {
        setIsSubmitting(true)
        try {
            if (editingSubcategory?.subcategory) {
                updateSubcategory(editingSubcategory.categoryId, editingSubcategory.subcategory.id, data)
                toast({ title: "Subcategoria atualizada" })
            } else {
                addSubcategory(editingSubcategory?.categoryId || 0, { ...data, spent: 0 })
                toast({ title: "Subcategoria adicionada" })
            }
            setSubcategoryDialogOpen(false)
            setEditingSubcategory(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteSubcategory = (categoryId: number, subcategoryId: number) => {
        setDeleteTarget({ type: "subcategory", categoryId, id: subcategoryId })
        setConfirmOpen(true)
    }

    // ── Confirmação de Exclusão ───────────────────────────────────────────────

    const handleConfirmDelete = () => {
        if (deleteTarget?.type === "category") {
            deleteCategory(deleteTarget.id)
        } else if (deleteTarget?.type === "subcategory") {
            deleteSubcategory(deleteTarget.categoryId, deleteTarget.id)
        }
        setConfirmOpen(false)
        setDeleteTarget(null)
    }

    return {
        // Estado e Contexto
        categories,
        settings,
        totalBudgeted,
        totalSpent,
        remaining,
        fixedExpenses,
        fixedExpensesTotal,
        isSubmitting,

        // Diálogos
        categoryDialogOpen, setCategoryDialogOpen,
        editingCategory,
        subcategoryDialogOpen, setSubcategoryDialogOpen,
        editingSubcategory,
        confirmOpen, setConfirmOpen,
        deleteTarget,

        // Handlers
        openAddCategoryDialog,
        openEditCategoryDialog,
        handleSaveCategory,
        handleDeleteCategory,
        openAddSubcategoryDialog,
        openEditSubcategoryDialog,
        handleSaveSubcategory,
        handleDeleteSubcategory,
        handleConfirmDelete,
        toggleCategory,
    }
}
