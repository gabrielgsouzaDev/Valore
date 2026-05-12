"use client"

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-muted/20">
                <Icon className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mb-8 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
                >
                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
