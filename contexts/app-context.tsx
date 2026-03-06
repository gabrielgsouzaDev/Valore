"use client"

import { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react"
import {
  Asset, Category, Goal, Settings, ScheduledTransaction,
  CreditCard, CardExpense, InvoiceProjection, Bank, ThemePreset, Subcategory, PatrimonialSnapshot
} from "@/lib/types"
import {
  themePresets, defaultSettings, defaultAssets, defaultCategories,
  defaultGoals, defaultTransactions, defaultCreditCards, defaultCardExpenses,
  defaultBanks, STORAGE_KEY, exampleData
} from "@/lib/constants"
import {
  calculateInvoices as calculateInvoicesUtil,
  generateId,
  calculateTotalNetWorth,
  calculateTotalBudgeted,
  calculateTotalSpent,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNextDate
} from "@/lib/services"
import { appStorageSchema } from "@/lib/schemas"
import "jspdf-autotable"

/**
 * Aplica o tema visual ao documento via variáveis CSS.
 * Esta função acessa a API do browser (document) por necessidade técnica.
 */
function applyThemeVariables(theme: ThemePreset) {
  if (typeof document === "undefined") return

  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
    root.style.setProperty(cssVarName, value as string)
  })

  // Alterna o modo claro/escuro
  if (theme.mode === "light") {
    root.classList.remove("dark")
  } else {
    root.classList.add("dark")
  }

  // Atualiza a meta tag theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const bgColor = `rgb(${theme.colors.background.split(" ").join(", ")})`
    metaThemeColor.setAttribute("content", bgColor)
  }
}

/**
 * Interface que define o formato de dados e funções expostas pelo contexto global da aplicação.
 */
type AppContextType = {
  // Ativos (Investimentos)
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Omit<Asset, "id" | "currentValue">) => void
  updateAsset: (id: number, data: Partial<Asset>) => void
  deleteAsset: (id: number) => void

  // Categorias (Orçamento)
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => void
  updateCategory: (id: number, data: Partial<Category>) => void
  deleteCategory: (id: number) => void
  addSubcategory: (categoryId: number, subcategory: Omit<Subcategory, "id">) => void
  updateSubcategory: (categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => void
  deleteSubcategory: (categoryId: number, subcategoryId: number) => void
  toggleCategory: (id: number) => void

  // Metas (Objetivos de Curto/Longo Prazo)
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Omit<Goal, "id">) => void
  updateGoal: (id: number, data: Partial<Goal>) => void
  deleteGoal: (id: number) => void
  addContributionToGoal: (goalId: number, amount: number) => void

  // Transações Agendadas
  transactions: ScheduledTransaction[]
  setTransactions: (transactions: ScheduledTransaction[]) => void
  addTransaction: (transaction: Omit<ScheduledTransaction, "id">) => void
  updateTransaction: (id: number, data: Partial<ScheduledTransaction>) => void
  deleteTransaction: (id: number) => void
  markAsPaid: (id: number) => void

  // Cartões de Crédito
  creditCards: CreditCard[]
  setCreditCards: (cards: CreditCard[]) => void
  addCreditCard: (card: Omit<CreditCard, "id">) => void
  updateCreditCard: (id: number, data: Partial<CreditCard>) => void
  deleteCreditCard: (id: number) => void

  // Despesas de Cartão
  cardExpenses: CardExpense[]
  setCardExpenses: (expenses: CardExpense[]) => void
  addCardExpense: (expense: Omit<CardExpense, "id">) => void
  updateCardExpense: (id: number, data: Partial<CardExpense>) => void
  deleteCardExpense: (id: number) => void

  // Bancos e Contas
  banks: Bank[]
  setBanks: (banks: Bank[]) => void
  addBank: (bank: Omit<Bank, "id">) => void
  updateBank: (id: number, data: Partial<Bank>) => void
  deleteBank: (id: number) => void
  getBankById: (id: number) => Bank | undefined
  getTotalBankBalance: () => number
  getLinkedItems: (bankId: number) => {
    assets: Asset[]
    goals: Goal[]
    transactions: ScheduledTransaction[]
    creditCards: CreditCard[]
  }

  // Histórico
  patrimonialHistory: PatrimonialSnapshot[]
  savePatrimonialSnapshot: () => void

  // Cálculos de Cartão
  calculateInvoices: (cardId?: number) => InvoiceProjection[]
  getTotalCardDebt: () => number
  getCardAvailableLimit: (cardId: number) => number

  // Configurações e Temas
  settings: Settings
  updateSettings: (data: Partial<Settings>) => void
  currentTheme: ThemePreset
  setTheme: (themeId: string) => void

  // Valores Computados
  totalNetWorth: number
  totalBudgeted: number
  totalSpent: number
  availableForInvestment: number
  monthlyScheduledIncome: number
  monthlyScheduledExpenses: number
  upcomingTransactions: ScheduledTransaction[]
  isLoaded: boolean

  // Utilitários de Dados
  exportData: (format: "json" | "csv") => void
  importData: (data: string) => boolean
  clearAllData: () => void
  loadExampleData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Provider principal da aplicação. Centraliza o estado e a persistência.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // --- Estado ---
  const [isLoaded, setIsLoaded] = useState(false)
  const [assets, setAssetsState] = useState<Asset[]>(defaultAssets)
  const [categories, setCategoriesState] = useState<Category[]>(defaultCategories)
  const [goals, setGoalsState] = useState<Goal[]>(defaultGoals)
  const [settings, setSettingsState] = useState<Settings>(defaultSettings)
  const [transactions, setTransactionsState] = useState<ScheduledTransaction[]>(defaultTransactions)
  const [creditCards, setCreditCardsState] = useState<CreditCard[]>(defaultCreditCards)
  const [cardExpenses, setCardExpensesState] = useState<CardExpense[]>(defaultCardExpenses)
  const [banks, setBanksState] = useState<Bank[]>(defaultBanks)
  const [patrimonialHistory, setPatrimonialHistory] = useState<PatrimonialSnapshot[]>([])

  // --- Temas ---
  const initialTheme = themePresets.find((t: ThemePreset) => t.id === "paper") || themePresets[0]
  const currentTheme = themePresets.find((t: ThemePreset) => t.id === settings.themeId) || initialTheme

  const setTheme = useCallback((themeId: string) => {
    setSettingsState((prev: Settings) => ({ ...prev, themeId }))
    const theme = themePresets.find((t: ThemePreset) => t.id === themeId) || initialTheme
    applyThemeVariables(theme)
  }, [initialTheme])

  // --- Valores Computados ---
  const totalNetWorth = useMemo(() => calculateTotalNetWorth(assets, banks), [assets, banks])
  const totalBudgeted = useMemo(() => calculateTotalBudgeted(categories), [categories])
  const totalSpent = useMemo(() => calculateTotalSpent(categories), [categories])

  const investmentCategory = useMemo(() => categories.find((c: Category) => c.name === "Investimentos"), [categories])
  const availableForInvestment = useMemo(() => investmentCategory ? investmentCategory.budgeted - investmentCategory.spent : 0, [investmentCategory])

  const monthlyScheduledIncome = useMemo(() => calculateMonthlyIncome(transactions), [transactions])
  const monthlyScheduledExpenses = useMemo(() => calculateMonthlyExpenses(transactions), [transactions])

  const upcomingTransactions = useMemo(() => transactions
    .filter((t: ScheduledTransaction) => t.status === "pendente")
    .sort((a: ScheduledTransaction, b: ScheduledTransaction) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5), [transactions])

  // --- Persistência (LocalStorage) ---
  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const rawParsed = JSON.parse(savedData)

        // Validação defensiva com Zod
        const validation = appStorageSchema.safeParse(rawParsed)

        if (validation.success) {
          const data = validation.data
          setAssetsState(data.assets)
          setCategoriesState(data.categories)
          setGoalsState(data.goals)
          setSettingsState(data.settings as Settings)
          setTransactionsState(data.transactions)
          setCreditCardsState(data.creditCards)
          setCardExpensesState(data.cardExpenses as CardExpense[])
          setBanksState(data.banks)
          setPatrimonialHistory(data.patrimonialHistory)

          // Aplica tema após carregar configurações
          setTimeout(() => {
            const theme = themePresets.find((t: ThemePreset) => t.id === (data.settings.themeId || "paper")) || initialTheme
            applyThemeVariables(theme)
          }, 0)
        } else {
          // Se falhar a validação (ex: schema antigo), tenta carregar o que for possível ou resetar
          console.warn("Falha na validação do localStorage, carregando exemplos.")
          loadExampleData()
        }
      } else {
        loadExampleData()
      }
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error)
      applyThemeVariables(initialTheme)
    }
    setIsLoaded(true)
  }, [initialTheme])

  useEffect(() => {
    if (!isLoaded) return
    try {
      const dataToSave = {
        _version: 1,
        assets, categories, goals, settings, transactions,
        creditCards, cardExpenses, banks, patrimonialHistory,
        lastUpdated: new Date().toISOString(),
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.warn("Storage cheio ou indisponível:", error)
    }
  }, [assets, categories, goals, settings, transactions, creditCards, cardExpenses, banks, patrimonialHistory, isLoaded])

  // --- Histórico Patrimonial ---
  const savePatrimonialSnapshot = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    setPatrimonialHistory((prev: PatrimonialSnapshot[]) => {
      const historyWithoutToday = prev.filter((s: PatrimonialSnapshot) => s.date !== today)
      return [...historyWithoutToday, { date: today, totalNetWorth }]
    })
  }, [totalNetWorth])

  // --- Snapshot Automático ---
  useEffect(() => {
    if (!isLoaded || totalNetWorth === 0) return

    const today = new Date().toISOString().split("T")[0]
    const hasTodaySnapshot = patrimonialHistory.some((s: PatrimonialSnapshot) => s.date === today)

    if (!hasTodaySnapshot) {
      savePatrimonialSnapshot()
    } else if (patrimonialHistory.length > 0) {
      const todaySnapshot = patrimonialHistory.find((s: PatrimonialSnapshot) => s.date === today)
      if (todaySnapshot && Math.abs(todaySnapshot.totalNetWorth - totalNetWorth) > 0.01) {
        savePatrimonialSnapshot()
      }
    }
  }, [totalNetWorth, isLoaded])

  // --- Funções de Ativos ---
  const setAssets = useCallback((newAssets: Asset[]) => setAssetsState(newAssets), [])

  const addAsset = useCallback((assetData: Omit<Asset, "id" | "currentValue">) => {
    const newAsset: Asset = {
      ...assetData,
      id: generateId(assets),
      currentValue: assetData.quantity * assetData.price,
      lastUpdated: new Date().toISOString(),
    }
    setAssetsState((prev: Asset[]) => [...prev, newAsset])
  }, [assets])

  const updateAsset = useCallback((id: number, data: Partial<Asset>) => {
    setAssetsState((prev: Asset[]) =>
      prev.map((asset: Asset) => {
        if (asset.id === id) {
          const updated = { ...asset, ...data }
          if (data.quantity !== undefined || data.price !== undefined) {
            updated.currentValue = (data.quantity ?? asset.quantity) * (data.price ?? asset.price)
            updated.lastUpdated = new Date().toISOString()
          }
          return updated
        }
        return asset
      }),
    )
  }, [])

  const deleteAsset = useCallback((id: number) => {
    setAssetsState((prev: Asset[]) => prev.filter((asset: Asset) => asset.id !== id))
  }, [])

  // --- Funções de Orçamento ---
  const setCategories = useCallback((newCategories: Category[]) => setCategoriesState(newCategories), [])

  const addCategory = useCallback((categoryData: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId(categories),
      spent: 0,
      subcategories: [],
      expanded: false,
    }
    setCategoriesState((prev: Category[]) => [...prev, newCategory])
  }, [categories])

  const updateCategory = useCallback((id: number, data: Partial<Category>) => {
    setCategoriesState((prev: Category[]) => prev.map((cat: Category) => (cat.id === id ? { ...cat, ...data } : cat)))
  }, [])

  const deleteCategory = useCallback((id: number) => {
    setCategoriesState((prev: Category[]) => prev.filter((cat: Category) => cat.id !== id))
  }, [])

  const addSubcategory = useCallback((categoryId: number, subcategoryData: Omit<Subcategory, "id">) => {
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => {
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
  }, [])

  const updateSubcategory = useCallback((categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => {
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id === categoryId) {
          const oldSub = cat.subcategories?.find((s: Subcategory) => s.id === subcategoryId)
          const oldSpent = oldSub?.spent || 0
          const newSpent = data.spent ?? oldSpent
          return {
            ...cat,
            subcategories: cat.subcategories?.map((sub: Subcategory) => (sub.id === subcategoryId ? { ...sub, ...data } : sub)),
            spent: cat.spent - oldSpent + newSpent,
          }
        }
        return cat
      }),
    )
  }, [])

  const deleteSubcategory = useCallback((categoryId: number, subcategoryId: number) => {
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id === categoryId) {
          const deletedSpent = cat.subcategories?.find((s: Subcategory) => s.id === subcategoryId)?.spent || 0
          return {
            ...cat,
            subcategories: cat.subcategories?.filter((sub: Subcategory) => sub.id !== subcategoryId),
            spent: cat.spent - deletedSpent,
          }
        }
        return cat
      }),
    )
  }, [])

  const toggleCategory = useCallback((id: number) => {
    setCategoriesState((prev: Category[]) => prev.map((cat: Category) => (cat.id === id ? { ...cat, expanded: !cat.expanded } : cat)))
  }, [])

  // --- Funções de Metas ---
  const setGoals = useCallback((newGoals: Goal[]) => setGoalsState(newGoals), [])

  const addGoal = useCallback((goalData: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateId(goals),
    }
    setGoalsState((prev: Goal[]) => [...prev, newGoal])
  }, [goals])

  const updateGoal = useCallback((id: number, data: Partial<Goal>) => {
    setGoalsState((prev: Goal[]) => prev.map((goal: Goal) => (goal.id === id ? { ...goal, ...data } : goal)))
  }, [])

  const deleteGoal = useCallback((id: number) => {
    setGoalsState((prev: Goal[]) => prev.filter((goal: Goal) => goal.id !== id))
  }, [])

  const addContributionToGoal = useCallback((goalId: number, amount: number) => {
    setGoalsState((prev: Goal[]) =>
      prev.map((goal: Goal) => (goal.id === goalId ? { ...goal, current: goal.current + amount } : goal)),
    )

  }, [])

  // --- Funções de Transações ---
  const setTransactions = useCallback((newTransactions: ScheduledTransaction[]) => setTransactionsState(newTransactions), [])

  const addTransaction = useCallback((transactionData: Omit<ScheduledTransaction, "id">) => {
    const newTransaction: ScheduledTransaction = {
      ...transactionData,
      id: generateId(transactions),
    }
    setTransactionsState((prev: ScheduledTransaction[]) => [...prev, newTransaction])
  }, [transactions])

  const updateTransaction = useCallback((id: number, data: Partial<ScheduledTransaction>) => {
    setTransactionsState((prev: ScheduledTransaction[]) => prev.map((t: ScheduledTransaction) => (t.id === id ? { ...t, ...data } : t)))
  }, [])

  const deleteTransaction = useCallback((id: number) => {
    setTransactionsState((prev: ScheduledTransaction[]) => prev.filter((t: ScheduledTransaction) => t.id !== id))
  }, [])

  const markAsPaid = useCallback((id: number) => {
    setTransactionsState((prev: ScheduledTransaction[]) => {
      const transaction = prev.find((t: ScheduledTransaction) => t.id === id)
      if (!transaction) return prev

      const updated = prev.map((t: ScheduledTransaction) => (t.id === id ? { ...t, status: "pago" as const } : t))

      if (transaction.type === "pagamento" && transaction.categoryId) {
        setCategoriesState((catPrev: Category[]) =>
          catPrev.map((cat: Category) =>
            cat.id === transaction.categoryId ? { ...cat, spent: cat.spent + transaction.amount } : cat,
          ),
        )
      }

      if (transaction.recurrence !== "unico") {
        const nextDate = calculateNextDate(transaction.dueDate, transaction.recurrence)
        const newTransaction: ScheduledTransaction = {
          ...transaction,
          id: generateId(prev),
          dueDate: nextDate,
          status: "pendente" as const,
        }
        return [...updated, newTransaction]
      }
      return updated
    })
  }, [calculateNextDate, generateId, setCategoriesState])

  // --- Funções de Cartão ---
  const setCreditCards = useCallback((cards: CreditCard[]) => setCreditCardsState(cards), [])

  const addCreditCard = useCallback((cardData: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...cardData,
      id: generateId(creditCards),
    }
    setCreditCardsState((prev: CreditCard[]) => [...prev, newCard])
  }, [creditCards])

  const updateCreditCard = useCallback((id: number, data: Partial<CreditCard>) => {
    setCreditCardsState((prev: CreditCard[]) => prev.map((card: CreditCard) => (card.id === id ? { ...card, ...data } : card)))
  }, [])

  const deleteCreditCard = useCallback((id: number) => {
    setCreditCardsState((prev: CreditCard[]) => prev.filter((card: CreditCard) => card.id !== id))
    setCardExpensesState((prev: CardExpense[]) => prev.filter((expense: CardExpense) => expense.cardId !== id))
  }, [])

  const setCardExpenses = useCallback((expenses: CardExpense[]) => setCardExpensesState(expenses), [])

  const addCardExpense = useCallback((expenseData: Omit<CardExpense, "id">) => {
    const newExpense: CardExpense = {
      ...expenseData,
      id: generateId(cardExpenses),
      paidInstallments: 0,
    }
    setCardExpensesState((prev: CardExpense[]) => [...prev, newExpense])
  }, [cardExpenses])

  const updateCardExpense = useCallback((id: number, data: Partial<CardExpense>) => {
    setCardExpensesState((prev: CardExpense[]) => prev.map((expense: CardExpense) => (expense.id === id ? { ...expense, ...data } : expense)))
  }, [])

  const deleteCardExpense = useCallback((id: number) => {
    setCardExpensesState((prev: CardExpense[]) => prev.filter((expense: CardExpense) => expense.id !== id))
  }, [])

  const calculateInvoices = useCallback((cardId?: number) => calculateInvoicesUtil(cardExpenses, creditCards, cardId), [cardExpenses, creditCards])

  const getTotalCardDebt = useCallback(() => {
    return cardExpenses.reduce((sum: number, expense: CardExpense) => {
      const remainingInstallments = expense.installments - (expense.paidInstallments || 0)
      const installmentValue = expense.totalAmount / expense.installments
      return sum + remainingInstallments * installmentValue
    }, 0)
  }, [cardExpenses])

  const getCardAvailableLimit = useCallback((cardId: number) => {
    const card = creditCards.find((c: CreditCard) => c.id === cardId)
    if (!card) return 0
    const invoices = calculateInvoices(cardId)
    const nextInvoice = invoices[0]?.total || 0
    return card.limit - nextInvoice
  }, [creditCards, calculateInvoices])

  // --- Funções de Bancos ---
  const setBanks = useCallback((newBanks: Bank[]) => setBanksState(newBanks), [])

  const addBank = useCallback((bankData: Omit<Bank, "id">) => {
    const newBank: Bank = {
      ...bankData,
      id: generateId(banks),
    }
    if (bankData.isMain) {
      setBanksState((prev: Bank[]) => prev.map((b: Bank) => ({ ...b, isMain: false })))
    }
    setBanksState((prev: Bank[]) => [...prev, newBank])
  }, [banks])

  const updateBank = useCallback((id: number, data: Partial<Bank>) => {
    if (data.isMain) {
      setBanksState((prev: Bank[]) => prev.map((b: Bank) => ({ ...b, isMain: b.id === id })))
    }
    setBanksState((prev: Bank[]) => prev.map((bank: Bank) => (bank.id === id ? { ...bank, ...data } : bank)))
  }, [])

  const deleteBank = useCallback((id: number) => {
    setAssetsState((prev: Asset[]) => prev.map((a: Asset) => (a.bankId === id ? { ...a, bankId: undefined } : a)))
    setGoalsState((prev: Goal[]) => prev.map((g: Goal) => (g.bankId === id ? { ...g, bankId: undefined } : g)))
    setTransactionsState((prev: ScheduledTransaction[]) => prev.map((t: ScheduledTransaction) => (t.bankId === id ? { ...t, bankId: undefined } : t)))
    setCreditCardsState((prev: CreditCard[]) => prev.map((c: CreditCard) => (c.bankId === id ? { ...c, bankId: undefined } : c)))
    setBanksState((prev: Bank[]) => prev.filter((bank: Bank) => bank.id !== id))
  }, [])

  const getBankById = useCallback((id: number) => banks.find((b: Bank) => b.id === id), [banks])

  const getTotalBankBalance = useCallback(() => banks.reduce((sum: number, bank: Bank) => sum + bank.balance, 0), [banks])

  const getLinkedItems = useCallback((bankId: number) => ({
    assets: assets.filter((a: Asset) => a.bankId === bankId),
    goals: goals.filter((g: Goal) => g.bankId === bankId),
    transactions: transactions.filter((t: ScheduledTransaction) => t.bankId === bankId),
    creditCards: creditCards.filter((c: CreditCard) => c.bankId === bankId),
  }), [assets, goals, transactions, creditCards])

  // --- Configurações ---
  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettingsState((prev: Settings) => ({ ...prev, ...data }))
    if (data.themeId) setTheme(data.themeId)
  }, [setTheme])

  // --- Backup e Restauração ---
  const exportData = useCallback((format: "json" | "csv" = "json") => {
    const dataToExport = {
      assets, categories, goals, settings, transactions,
      creditCards, cardExpenses, banks, patrimonialHistory,
      exportedAt: new Date().toISOString(),
      version: "1.2.0-clean",
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `investment-dashboard-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      let csv = "Tipo,Detalhes\n"
      assets.forEach((a: Asset) => csv += `Ativo,${a.name},${a.currentValue}\n`)
      banks.forEach((b: Bank) => csv += `Banco,${b.name},${b.balance}\n`)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `investment-dashboard-simple-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [assets, categories, goals, settings, transactions, creditCards, cardExpenses, banks, patrimonialHistory])

  const importData = useCallback((dataString: string): boolean => {
    try {
      const parsed = JSON.parse(dataString)
      if (parsed.assets) setAssetsState(parsed.assets)
      if (parsed.categories) setCategoriesState(parsed.categories)
      if (parsed.goals) setGoalsState(parsed.goals)
      if (parsed.settings) {
        setSettingsState(parsed.settings)
        // Se houver tema salvo, aplica. Senão, 'paper'
        setTheme(parsed.settings.themeId || "paper")
      }
      if (parsed.transactions) setTransactionsState(parsed.transactions)
      if (parsed.creditCards) setCreditCardsState(parsed.creditCards)
      if (parsed.cardExpenses) setCardExpensesState(parsed.cardExpenses)
      if (parsed.banks) setBanksState(parsed.banks)
      if (parsed.patrimonialHistory) setPatrimonialHistory(parsed.patrimonialHistory)
      return true
    } catch {
      return false
    }
  }, [setTheme])

  const loadExampleData = useCallback(() => {
    const currentName = settings.nome
    const dataWithUserContext = {
      ...exampleData,
      settings: {
        ...exampleData.settings,
        nome: currentName || exampleData.settings.nome
      }
    }
    importData(JSON.stringify(dataWithUserContext))
  }, [importData, settings.nome])

  const clearAllData = useCallback(() => {
    if (typeof window !== "undefined" && confirm("Tem certeza que deseja apagar todos os dados?")) {
      window.localStorage.removeItem(STORAGE_KEY)
      setAssetsState([])
      setCategoriesState([])
      setGoalsState([])
      setSettingsState(defaultSettings)
      setTransactionsState([])
      setCreditCardsState([])
      setCardExpensesState([])
      setBanksState([])
      setPatrimonialHistory([])
      setTheme("paper")
    }
  }, [setTheme])

  const value = useMemo(() => ({
    assets, setAssets, addAsset, updateAsset, deleteAsset,
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory,
    goals, setGoals, addGoal, updateGoal, deleteGoal, addContributionToGoal,
    transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction, markAsPaid,
    creditCards, setCreditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    cardExpenses, setCardExpenses, addCardExpense, updateCardExpense, deleteCardExpense,
    banks, setBanks, addBank, updateBank, deleteBank, getBankById, getTotalBankBalance, getLinkedItems,
    patrimonialHistory, savePatrimonialSnapshot,
    calculateInvoices, getTotalCardDebt, getCardAvailableLimit,
    settings, updateSettings, currentTheme, setTheme,
    totalNetWorth, totalBudgeted, totalSpent, availableForInvestment,
    monthlyScheduledIncome, monthlyScheduledExpenses, upcomingTransactions,
    isLoaded,
    exportData, importData, clearAllData, loadExampleData,
  }), [
    assets, setAssets, addAsset, updateAsset, deleteAsset,
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory,
    goals, setGoals, addGoal, updateGoal, deleteGoal, addContributionToGoal,
    transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction, markAsPaid,
    creditCards, setCreditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    cardExpenses, setCardExpenses, addCardExpense, updateCardExpense, deleteCardExpense,
    banks, setBanks, addBank, updateBank, deleteBank, getBankById, getTotalBankBalance, getLinkedItems,
    patrimonialHistory, savePatrimonialSnapshot,
    calculateInvoices, getTotalCardDebt, getCardAvailableLimit,
    settings, updateSettings, currentTheme, setTheme,
    totalNetWorth, totalBudgeted, totalSpent, availableForInvestment,
    monthlyScheduledIncome, monthlyScheduledExpenses, upcomingTransactions,
    isLoaded,
    exportData, importData, clearAllData, loadExampleData,
  ])


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook customizado para acessar o contexto global da aplicação.
 */
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp deve ser utilizado dentro de um AppProvider")
  }
  return context
}
