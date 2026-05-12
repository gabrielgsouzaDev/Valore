"use client"

/**
 * dropdown-menu.tsx
 *
 * Implementação própria de DropdownMenu sem dependência do Radix UI.
 *
 * API compatível com o uso no CategoryCard:
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild>
 *       <Button>...</Button>
 *     </DropdownMenuTrigger>
 *     <DropdownMenuContent align="end" className="w-44">
 *       <DropdownMenuItem onClick={...}>...</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem>...</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  cloneElement,
  isValidElement,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Contexto ──────────────────────────────────────────────────────────────────

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  /*
   * triggerRef aponta para o wrapper <span> que envolve o trigger.
   * Isso evita o problema de passar ref via cloneElement,
   * que o React 18 não suporta sem forwardRef.
   */
  triggerRef: React.RefObject<HTMLSpanElement | null>
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext)
  if (!ctx) throw new Error("useDropdownMenu deve ser usado dentro de <DropdownMenu>")
  return ctx
}

// ── DropdownMenu ──────────────────────────────────────────────────────────────

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLSpanElement | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback((value: boolean) => {
    if (!isControlled) setInternalOpen(value)
    onOpenChange?.(value)
  }, [isControlled, onOpenChange])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

// ── DropdownMenuTrigger ───────────────────────────────────────────────────────

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu()

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }, [open, setOpen])

  /*
   * Solução para o erro 2769:
   *
   * Em vez de passar ref via cloneElement (não suportado no React 18
   * sem forwardRef), envolvemos o filho em um <span> com ref.
   *
   * O <span> é inline-flex para não alterar o layout do filho,
   * e captura o bounding rect para posicionar o menu corretamente.
   *
   * asChild=true → filho renderizado diretamente dentro do span
   * asChild=false → span com button nativo interno
   */
  if (asChild && isValidElement<React.HTMLAttributes<HTMLElement>>(children)) {
    return (
      <span
        ref={triggerRef}
        style={{ display: "contents" }}
        onClick={handleClick}
      >
        {cloneElement(children, {
          "aria-expanded": open,
          "aria-haspopup": "menu" as const,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            /*
             * Preserva o onClick original do filho.
             * handleClick já é chamado pelo span pai via bubbling,
             * então não precisamos chamá-lo aqui novamente —
             * apenas preservamos o comportamento original do filho.
             */
            children.props.onClick?.(e)
          },
        })}
      </span>
    )
  }

  return (
    <span
      ref={triggerRef}
      style={{ display: "contents" }}
    >
      <button
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {children}
      </button>
    </span>
  )
}

// ── DropdownMenuContent ───────────────────────────────────────────────────────

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
  sideOffset?: number
}

function DropdownMenuContent({
  children,
  align = "start",
  className,
  sideOffset = 4,
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu()
  const contentRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /*
   * Calcula posição fixed baseada no bounding rect do span wrapper.
   * O span com display:contents não tem dimensões próprias —
   * usamos o firstElementChild para obter o rect do filho real.
   */
  useEffect(() => {
    if (!open || !triggerRef.current) return

    const triggerEl =
      triggerRef.current.firstElementChild ?? triggerRef.current
    const rect = triggerEl.getBoundingClientRect()
    const top = rect.bottom + sideOffset

    let left: number
    if (align === "end") {
      left = rect.right
    } else if (align === "center") {
      left = rect.left + rect.width / 2
    } else {
      left = rect.left
    }

    setPosition({ top, left })
  }, [open, align, sideOffset, triggerRef])

  /*
   * Fecha ao clicar fora — mousedown captura antes do click
   * para evitar race condition de reabertura.
   */
  useEffect(() => {
    if (!open) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) return
      setOpen(false)
    }

    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [open, setOpen, triggerRef])

  /*
   * Fecha ao pressionar Escape e devolve foco ao trigger.
   */
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
        const triggerEl = triggerRef.current?.firstElementChild as HTMLElement | null
        triggerEl?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen, triggerRef])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          role="menu"
          aria-orientation="vertical"
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: position.top,
            left: align === "end" ? "auto" : position.left,
            right: align === "end"
              ? `calc(100vw - ${position.left}px)`
              : "auto",
            transformOrigin: align === "end" ? "top right" : "top left",
            zIndex: 50,
          }}
          className={cn(
            "min-w-[8rem] overflow-hidden",
            "rounded-lg border border-border/50",
            "bg-popover text-popover-foreground",
            "shadow-lg shadow-black/10",
            "p-1",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ── DropdownMenuItem ──────────────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  className?: string
  disabled?: boolean
}

function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu()

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
    setOpen(false)
  }, [disabled, onClick, setOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (disabled) return
      const syntheticEvent = e as unknown as React.MouseEvent<HTMLDivElement>
      onClick?.(syntheticEvent)
      setOpen(false)
    }
  }, [disabled, onClick, setOpen])

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      className={cn(
        "relative flex items-center gap-2",
        "rounded-md px-2 py-1.5",
        "text-sm outline-none select-none",
        "cursor-pointer transition-colors duration-100",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </div>
  )
}

// ── DropdownMenuSeparator ─────────────────────────────────────────────────────

interface DropdownMenuSeparatorProps {
  className?: string
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        "-mx-1 my-1 h-px bg-border/50",
        className
      )}
    />
  )
}

// ── DropdownMenuLabel ─────────────────────────────────────────────────────────

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        "px-2 py-1.5",
        "text-xs font-black uppercase tracking-widest",
        "text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

// ── Exports ───────────────────────────────────────────────────────────────────

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}