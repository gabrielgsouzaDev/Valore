"use client"

/**
 * useCategoryActions.ts
 *
 * Estado de UI e handlers de CRUD para categorias e subcategorias.
 *
 * Separado do useEconomy para:
 *   1. Isolar estado de dialogs da lógica de dados
 *   2. Clareza — tudo relacionado a abrir/fechar/salvar/deletar fica aqui
 *   3. useEconomy fica enxuto e legível
 *
 * Recebe as funções de mutação via parâmetro para não acoplar
 * diretamente ao useApp — facilita testes e substituição futura.
 */

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Category, Subcategory } from "@/lib/types"

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CategoryInput {
  name: string
  percentage: number
  budgeted: number
  color: string
}

/*
 * SubcategoryInput — inclui spent porque addSubcategory
 * precisa inicializar o valor (sempre 0 na criação).
 */
interface SubcategoryInput extends Omit<Subcategory, "id" | "spent"> {
  spent: number
}

interface CategoryMutations {
  addCategory: (data: CategoryInput) => Promise<void>
  updateCategory: (id: number, data: CategoryInput) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  addSubcategory: (categoryId: number, data: SubcategoryInput) => Promise<void>
  updateSubcategory: (
    categoryId: number,
    subcategoryId: number,
    data: Omit<Subcategory, "id" | "spent">
  ) => Promise<void>
  deleteSubcategory: (categoryId: number, subcategoryId: number) => Promise<void>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCategoryActions({
  addCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
}: CategoryMutations) {

  const { toast } = useToast()

  // ── Estado dos Diálogos ─────────────────────────────────────────────────

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: number
    subcategory: Subcategory | null
  } | null>(null)

  /*
   * confirmOpen + deleteTarget — estado interno da confirmação de exclusão.
   *
   * deleteTarget NÃO é exportado — é detalhe de implementação interno.
   * O page.tsx não precisa saber o que está sendo deletado,
   * apenas controlar abertura/fechamento e confirmar a ação.
   */
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "category"; id: number }
    | { type: "subcategory"; categoryId: number; id: number }
    | null
  >(null)

  // ── Handlers de Categoria ───────────────────────────────────────────────

  const openAddCategoryDialog = () => {
    setEditingCategory(null)
    setCategoryDialogOpen(true)
  }

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryDialogOpen(true)
  }

  const handleSaveCategory = async (data: CategoryInput) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
        toast({ title: "Categoria atualizada" })
      } else {
        await addCategory(data)
        toast({ title: "Categoria adicionada" })
      }
      setCategoryDialogOpen(false)
      setEditingCategory(null)
    } catch (err) {
      toast({ title: "Não foi possível salvar a categoria", description: String(err), variant: "destructive" })
    }
  }

  const handleDeleteCategory = (id: number) => {
    setDeleteTarget({ type: "category", id })
    setConfirmOpen(true)
  }

  // ── Handlers de Subcategoria ────────────────────────────────────────────

  const openAddSubcategoryDialog = (categoryId: number) => {
    setEditingSubcategory({ categoryId, subcategory: null })
    setSubcategoryDialogOpen(true)
  }

  const openEditSubcategoryDialog = (categoryId: number, subcategory: Subcategory) => {
    setEditingSubcategory({ categoryId, subcategory })
    setSubcategoryDialogOpen(true)
  }

  const handleSaveSubcategory = async (data: Omit<Subcategory, "id" | "spent">) => {
    try {
      if (editingSubcategory?.subcategory) {
        // Edição — subcategoria existente (categoryId e id sempre presentes).
        await updateSubcategory(
          editingSubcategory.categoryId,
          editingSubcategory.subcategory.id,
          data
        )
        toast({ title: "Item atualizado" })
      } else if (editingSubcategory?.categoryId) {
        // Criação — guard explícito no categoryId (evita ID inválido silencioso).
        await addSubcategory(
          editingSubcategory.categoryId,
          { ...data, spent: 0 }
        )
        toast({ title: "Item adicionado" })
      }
      setSubcategoryDialogOpen(false)
      setEditingSubcategory(null)
    } catch (err) {
      toast({ title: "Não foi possível salvar o item", description: String(err), variant: "destructive" })
    }
  }

  const handleDeleteSubcategory = (categoryId: number, subcategoryId: number) => {
    setDeleteTarget({ type: "subcategory", categoryId, id: subcategoryId })
    setConfirmOpen(true)
  }

  // ── Confirmação de Exclusão ─────────────────────────────────────────────

  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === "category") {
      deleteCategory(deleteTarget.id)
      toast({ title: "Categoria excluída" })
    } else {
      deleteSubcategory(deleteTarget.categoryId, deleteTarget.id)
      toast({ title: "Item excluído" })
    }

    setConfirmOpen(false)
    setDeleteTarget(null)
  }

  // ── Retorno ─────────────────────────────────────────────────────────────

  // ── Retorno ─────────────────────────────────────────────────────────────

  return {
    // Estado dos diálogos
    categoryDialogOpen,
    setCategoryDialogOpen,
    editingCategory,
    subcategoryDialogOpen,
    setSubcategoryDialogOpen,
    editingSubcategory,
    confirmOpen,
    setConfirmOpen,

    // Handlers de categoria
    openAddCategoryDialog,
    openEditCategoryDialog,
    handleSaveCategory,
    handleDeleteCategory,

    // Handlers de subcategoria — nomes completos para bater com page.tsx
    openAddSubcategoryDialog,
    openEditSubcategoryDialog,
    handleSaveSubcategory,
    handleDeleteSubcategory,

    // Confirmação
    handleConfirmDelete,
  }
}