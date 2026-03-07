"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    variant?: "destructive" | "default"
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Excluir",
    cancelLabel = "Cancelar",
    onConfirm,
    variant = "destructive",
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-border text-foreground hover:bg-muted bg-transparent">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            variant === "destructive"
                                ? "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
