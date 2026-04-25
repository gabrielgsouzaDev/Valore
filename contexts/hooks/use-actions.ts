import { useCallback } from "react"
import { Asset, Category, Subcategory, ScheduledTransaction } from "@/lib/types"
import { db } from "@/lib/db"

export function useAssetActions(
  assets: Asset[],
  setAssetsState: React.Dispatch<React.SetStateAction<Asset[]>>
) {
  const addAsset = useCallback(async (assetData: Omit<Asset, "id" | "currentValue">) => {
    const newAsset: Asset = {
      ...assetData,
      id: 0, // Dexie auto-increment will override
      currentValue: assetData.quantity * assetData.price,
      lastUpdated: new Date().toISOString(),
    }
    // Gravação direta no IndexedDB - useLiveDb cuidará da atualização da UI
    await db.table("assets").add(newAsset)
  }, [])

  const updateAsset = useCallback(async (id: number, data: Partial<Asset>) => {
    const asset = await db.table("assets").get(id)
    if (!asset) return

    const updatedAsset = { ...asset, ...data }
    const quantity = data.quantity ?? asset.quantity
    const price = data.price ?? asset.price

    if (data.quantity !== undefined || data.price !== undefined) {
      updatedAsset.currentValue = quantity * price
      updatedAsset.lastUpdated = new Date().toISOString()
    }

    await db.table("assets").put(updatedAsset)
  }, [])

  const deleteAsset = useCallback(async (id: number) => {
    await db.table("assets").delete(id)
  }, [])

  return { addAsset, updateAsset, deleteAsset }
}

export function useCategoryActions(
  categories: Category[],
  setCategoriesState: React.Dispatch<React.SetStateAction<Category[]>>,
  setTransactionsState: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>>
) {
  const addCategory = useCallback(async (categoryData: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => {
    const newCategory: Category = {
      ...categoryData,
      id: 0, // Dexie auto-increment will override
      spent: 0,
      subcategories: [],
      expanded: false,
    }
    await db.table("categories").add(newCategory)
  }, [])

  const updateCategory = useCallback(async (id: number, data: Partial<Category>) => {
    const cat = await db.table("categories").get(id)
    if (cat) {
      await db.table("categories").put({ ...cat, ...data })
    }
  }, [])

  const deleteCategory = useCallback(async (id: number) => {
    await db.transaction("rw", [db.table("categories"), db.table("transactions")], async () => {
      await db.table("categories").delete(id)
      // Limpa referência da categoria nas transações
      const transactions = await db.table("transactions").where("categoryId").equals(id).toArray()
      for (const t of transactions) {
        await db.table("transactions").update(t.id, { categoryId: undefined })
      }
    })
  }, [])

  const addSubcategory = useCallback(async (categoryId: number, subcategoryData: Omit<Subcategory, "id">) => {
    await db.transaction("rw", db.categories, async () => {
      const cat = await db.categories.get(categoryId)
      if (!cat) return

      const existingSubs = cat.subcategories || []
      const newSub: Subcategory = {
        ...subcategoryData,
        id: existingSubs.length > 0 ? Math.max(...existingSubs.map((s: Subcategory) => s.id), 0) + 1 : 1,
      }

      await db.categories.put({
        ...cat,
        subcategories: [...existingSubs, newSub],
        spent: cat.spent + subcategoryData.spent,
      })
    })
  }, [])

  const updateSubcategory = useCallback(async (categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => {
    await db.transaction("rw", db.categories, async () => {
      const cat = await db.categories.get(categoryId)
      if (!cat) return

      const oldSub = cat.subcategories?.find((s: Subcategory) => s.id === subcategoryId)
      if (!oldSub) return

      const oldSpent = oldSub.spent
      const newSpent = data.spent ?? oldSpent

      await db.categories.put({
        ...cat,
        subcategories: cat.subcategories?.map((sub: Subcategory) => (sub.id === subcategoryId ? { ...sub, ...data } : sub)),
        spent: cat.spent - oldSpent + newSpent,
      })
    })
  }, [])

  const deleteSubcategory = useCallback(async (categoryId: number, subcategoryId: number) => {
    await db.transaction("rw", db.categories, async () => {
      const cat = await db.categories.get(categoryId)
      if (!cat) return

      const deletedSpent = cat.subcategories?.find((s: Subcategory) => s.id === subcategoryId)?.spent || 0
      await db.categories.put({
        ...cat,
        subcategories: cat.subcategories?.filter((sub: Subcategory) => sub.id !== subcategoryId),
        spent: cat.spent - deletedSpent,
      })
    })
  }, [])

  const toggleCategory = useCallback(async (id: number) => {
    const cat = await db.table("categories").get(id)
    if (cat) {
      await db.table("categories").update(id, { expanded: !cat.expanded })
    }
  }, [])

  return { addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory }
}
