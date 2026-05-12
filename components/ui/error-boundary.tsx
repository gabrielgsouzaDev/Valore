"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertOctagon, RefreshCcw } from "lucide-react"

interface Props {
    children: ReactNode
    moduleName?: string
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // In a production app, we would log this to an error reporting service
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Card className="p-8 border-2 border-dashed border-danger/50 bg-danger/5 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-danger/10">
                        <AlertOctagon className="h-8 w-8 text-danger" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Ops! Algo deu errado no módulo {this.props.moduleName || ""}</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                            Ocorreu um erro inesperado ao carregar este componente. Seus dados continuam salvos.
                        </p>
                    </div>
                    <Button
                        onClick={() => this.setState({ hasError: false })}
                        variant="outline"
                        className="border-danger/30 hover:bg-danger/10 text-danger hover:text-danger flex items-center gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Tentar Novamente
                    </Button>
                </Card>
            )
        }

        return this.props.children
    }
}
