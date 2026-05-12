"use client"

import * as React from "react"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer"

interface ResponsiveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    trigger?: React.ReactNode
}

export function ResponsiveDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    trigger,
}: ResponsiveDialogProps) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
                <DrawerContent className="bg-background border-border text-foreground max-h-[90vh]">
                    <DrawerHeader className="text-left border-b border-border/50 pb-4">
                        <DrawerTitle className="text-lg">{title}</DrawerTitle>
                        {description && <DrawerDescription>{description}</DrawerDescription>}
                    </DrawerHeader>
                    <div className="px-4 py-4 overflow-y-auto flex-1">
                        {children}
                    </div>
                    {footer && <DrawerFooter className="pt-4 border-t border-border/50 pb-8">{footer}</DrawerFooter>}
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
            <DialogContent className="bg-card border-border text-foreground mx-auto max-h-[90vh] overflow-y-auto sm:max-w-md md:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="py-2">
                    {children}
                </div>
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
