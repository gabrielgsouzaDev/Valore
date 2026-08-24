import { useCallback } from "react"
import { Asset, Goal, ScheduledTransaction, CreditCard, CardExpense, Bank } from "@/lib/types"
import { db } from "@/lib/db"

export function useCardActions(
  creditCards: CreditCard[],
  setCreditCardsState: React.Dispatch<React.SetStateAction<CreditCard[]>>,
  cardExpenses: CardExpense[],
  setCardExpensesState: React.Dispatch<React.SetStateAction<CardExpense[]>>
) {
  const addCreditCard = useCallback(async (cardData: Omit<CreditCard, "id">) => {
    await db.table("creditCards").add(cardData as CreditCard)
  }, [])

  const updateCreditCard = useCallback(async (id: number, data: Partial<CreditCard>) => {
    const card = await db.table("creditCards").get(id)
    if (card) {
      await db.table("creditCards").put({ ...card, ...data })
    }
  }, [])

  const deleteCreditCard = useCallback(async (id: number) => {
    await db.transaction("rw", [db.table("creditCards"), db.table("cardExpenses")], async () => {
      await db.table("creditCards").delete(id)
      await db.table("cardExpenses").where("cardId").equals(id).delete()
    })
  }, [])

  const addCardExpense = useCallback(async (expenseData: Omit<CardExpense, "id">) => {
    const newExpense = {
      ...expenseData,
      paidInstallments: 0,
    }
    // Sem `id`: deixa o `++id` do Dexie auto-incrementar (ver addAsset).
    await db.table("cardExpenses").add(newExpense)
  }, [])

  const updateCardExpense = useCallback(async (id: number, data: Partial<CardExpense>) => {
    const exp = await db.table("cardExpenses").get(id)
    if (exp) {
      await db.table("cardExpenses").put({ ...exp, ...data })
    }
  }, [])

  const deleteCardExpense = useCallback(async (id: number) => {
    await db.table("cardExpenses").delete(id)
  }, [])

  return { addCreditCard, updateCreditCard, deleteCreditCard, addCardExpense, updateCardExpense, deleteCardExpense }
}

export function useBankActions(
  banks: Bank[],
  setBanksState: React.Dispatch<React.SetStateAction<Bank[]>>,
  setAssetsState: React.Dispatch<React.SetStateAction<Asset[]>>,
  setGoalsState: React.Dispatch<React.SetStateAction<Goal[]>>,
  setTransactionsState: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>>,
  setCreditCardsState: React.Dispatch<React.SetStateAction<CreditCard[]>>
) {
  const addBank = useCallback(async (bankData: Omit<Bank, "id">) => {
    await db.transaction("rw", db.banks, async () => {
      if (bankData.isMain) {
        await db.banks.toCollection().modify({ isMain: false })
      }
      await db.banks.add(bankData as Bank)
    })
  }, [])

  const updateBank = useCallback(async (id: number, data: Partial<Bank>) => {
    await db.transaction("rw", db.banks, async () => {
      const bank = await db.banks.get(id)
      if (!bank) return

      if (data.isMain) {
        await db.banks.toCollection().modify((b) => { b.isMain = b.id === id })
      }

      const finalData = data.isMain ? { ...bank, ...data, isMain: true } : { ...bank, ...data }
      await db.banks.put(finalData)
    })
  }, [])

  const deleteBank = useCallback(async (id: number) => {
    await db.transaction("rw", [
      db.table("banks"), db.table("assets"), db.table("goals"),
      db.table("transactions"), db.table("creditCards")
    ], async () => {
      // Limpa referências antes de deletar o banco
      await db.table("assets").where("bankId").equals(id).modify({ bankId: undefined })
      await db.table("goals").where("bankId").equals(id).modify({ bankId: undefined })
      await db.table("transactions").where("bankId").equals(id).modify({ bankId: undefined })
      await db.table("creditCards").where("bankId").equals(id).modify({ bankId: undefined })
      await db.table("banks").delete(id)
    })
  }, [])

  return { addBank, updateBank, deleteBank }
}
