/**
 * layout.tsx — Shell estrutural do módulo Economia
 *
 * Responsabilidade: definir a estrutura de altura e scroll da rota.
 * Sem lógica de negócio, sem dados, sem estado.
 *
 * Estrutura resultante:
 *
 * ┌─────────────────────────────────────────────────┐
 * │  [TopBar mobile — sticky, oculta em lg+]        │
 * ├──────────────┬──────────────────────────────────┤
 * │              │                                  │
 * │  Sidebar     │  {children}                      │
 * │  240px fixo  │  scroll independente             │
 * │  oculta <lg  │  fluido                          │
 * │              │                                  │
 * └──────────────┴──────────────────────────────────┘
 *
 * Nota: a Sidebar e a TopBar são renderizadas dentro do page.tsx
 * porque precisam de props derivadas do useEconomy.
 * Este layout apenas garante que o espaço para elas existe.
 */

import type { ReactNode } from "react"

interface EconomiaLayoutProps {
  children: ReactNode
}

export default function EconomiaLayout({ children }: EconomiaLayoutProps) {
  return (
    /*
     * Wrapper raiz:
     * - flex-col para empilhar verticalmente
     * - h-screen para ocupar toda a viewport
     * - overflow-hidden para que o scroll seja controlado
     *   pelos filhos individualmente (sidebar vs main)
     *
     * Não usamos min-h-screen aqui porque queremos que o
     * layout seja exatamente a altura da viewport — sem
     * crescer além dela. O scroll acontece dentro do <main>.
     */
    <div className="flex flex-col h-screen overflow-hidden bg-background">

      {/*
       * Slot para o conteúdo da página (page.tsx).
       *
       * O page.tsx renderiza internamente:
       *   1. <EconomyTopBar />  — sticky, visível só em mobile
       *   2. <DemoBanner />     — faixa de aviso
       *   3. <div className="flex flex-1 min-h-0">
       *        <EconomySidebar />   — 240px, visível só em lg+
       *        <main>...</main>     — fluido, scroll próprio
       *      </div>
       *
       * O `flex flex-1 min-h-0` no page.tsx é crítico:
       *   - flex-1: ocupa o espaço restante após TopBar e Banner
       *   - min-h-0: permite que o flex item encolha abaixo
       *     do seu conteúdo natural (necessário para overflow
       *     funcionar corretamente em contextos flex aninhados)
       */}
      {children}

    </div>
  )
}