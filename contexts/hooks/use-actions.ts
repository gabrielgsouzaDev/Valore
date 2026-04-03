import { useCallback } from "react"
import { Asset, Category, Subcategory, ScheduledTransaction } from "@/lib/types"
import { generateId } from "@/lib/services"

export function useAssetActions(
  assets: Asset[],
  setAssetsState: React.Dispatch<React.SetStateAction<Asset[]>>
) {
  const addAsset = useCallback((assetData: Omit<Asset, "id" | "currentValue">) => {
    const newAsset: Asset = {
      ...assetData,
      id: generateId(assets),
      currentValue: assetData.quantity * assetData.price,
      lastUpdated: new Date().toISOString(),
    }
    setAssetsState((prev) => [...prev, newAsset])
  }, [assets, setAssetsState])

  const updateAsset = useCallback((id: number, data: Partial<Asset>) => {
    setAssetsState((prev) =>
      prev.map((asset) => {
        if (asset.id === id) {
          const updated = { ...asset, ...data }
          const quantity = data.quantity ?? asset.quantity
          const price = data.price ?? asset.price

          if (data.quantity !== undefined || data.price !== undefined) {
            updated.currentValue = quantity * price
            updated.lastUpdated = new Date().toISOString()
          }
          return updated
        }
        return asset
      }),
    )
  }, [setAssetsState])

  const deleteAsset = useCallback((id: number) => {
    setAssetsState((prev) => prev.filter((asset) => asset.id !== id))
  }, [setAssetsState])

  return { addAsset, updateAsset, deleteAsset }
}

export function useCategoryActions(
  categories: Category[],
  setCategoriesState: React.Dispatch<React.SetStateAction<Category[]>>,
  setTransactionsState: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>>
) {
  const addCategory = useCallback((categoryData: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId(categories),
      spent: 0,
      subcategories: [],
      expanded: false,
    }
    setCategoriesState((prev) => [...prev, newCategory])
  }, [categories, setCategoriesState])

  const updateCategory = useCallback((id: number, data: Partial<Category>) => {
    setCategoriesState((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)))
  }, [setCategoriesState])

  const deleteCategory = useCallback((id: number) => {
    setCategoriesState((prev) => prev.filter((cat) => cat.id !== id))
    setTransactionsState((prev) =>
      prev.map((t) => t.categoryId === id ? { ...t, categoryId: undefined } : t)
    )
  }, [setCategoriesState, setTransactionsState])

  const addSubcategory = useCallback((categoryId: number, subcategoryData: Omit<Subcategory, "id">) => {
    setCategoriesState((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const newSub: Subcategory = {
            ...subcategoryData,
            id: generateId(cat.subcategories || []),
          }
          return {
            ...cat,
            subcategories: [...(cat.subcategories || []), newSub],
            spent: cat.spent + subcategoryData.spent,
          }
        }
        return cat
      }),
    )
  }, [setCategoriesState])

  const updateSubcategory = useCallback((categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => {
    setCategoriesState((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const oldSub = cat.subcategories?.find((s) => s.id === subcategoryId)
          const oldSpent = oldSub?.spent || 0
          const newSpent = data.spent ?? oldSpent
          return {
            ...cat,
            subcategories: cat.subcategories?.map((sub) => (sub.id === subcategoryId ? { ...sub, ...data } : sub)),
            spent: cat.spent - oldSpent + newSpent,
          }
        }
        return cat
      }),
    )
  }, [setCategoriesState])

  const deleteSubcategory = useCallback((categoryId: number, subcategoryId: number) => {
    setCategoriesState((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const deletedSpent = cat.subcategories?.find((s) => s.id === subcategoryId)?.spent || 0
          return {
            ...cat,
            subcategories: cat.subcategories?.filter((sub) => sub.id !== subcategoryId),
            spent: cat.spent - deletedSpent,
          }
        }
        return cat
      }),
    )
  }, [setCategoriesState])

  const toggleCategory = useCallback((id: number) => {
    setCategoriesState((prev) => prev.map((cat) => (cat.id === id ? { ...cat, expanded: !cat.expanded } : cat)))
  }, [setCategoriesState])

  return { addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory }
}
