"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

// --- Hooks Auxiliares ---
function useInView(options = { threshold: 0.1 }) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.disconnect()
      }
    }, options)
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, options.threshold])

  return { setRef, isInView }
}

// --- Componentes da Landing Page ---
export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (email && email.includes("@")) {
      setSubscribed(true)
      setEmail("")
    }
  }

  if (!mounted) return null

  return (
    <div className={cn("min-h-screen bg-[#080705] text-zinc-100 font-sans overflow-x-hidden selection:bg-[#8B5E3C]/30", playfair.variable)}>

      {/* 1. Header Fixo Minimalista */}
      <header className="fixed top-0 w-full border-b border-white/5 bg-[#080705]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-playfair font-extrabold text-[#8B5E3C] text-2xl tracking-tight">Valore</span>
          </div>
        </div>
      </header>

      <main className="pt-24 sm:pt-32 pb-20">
        {/* 2. Hero Section */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div className="space-y-8 relative z-10 lg:pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-xs font-medium text-zinc-300 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <span className="flex h-2 w-2 rounded-full bg-[#8B5E3C] animate-pulse" />
              Gratuito durante o beta
            </div>

            <div className="space-y-6">
              <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both delay-150 text-white">
                Seu patrimônio,<br />com clareza.
              </h1>
              <p className="text-lg sm:text-xl text-zinc-400 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both delay-300">
                Dashboard financeiro completo para quem investe com seriedade.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both delay-500 pt-4">
              <a href="#waitlist" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-100 hover:bg-white text-black font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2">
                Garantir Acesso Antecipado
              </a>
              <Link href="/app" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-transparent hover:bg-white/5 text-zinc-100 font-semibold tracking-wide transition-all text-center">
                Explorar Demo
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square animate-in fade-in zoom-in-95 duration-700 fill-mode-both delay-500 mt-12 lg:mt-0">
            {/* Abstract Dashboard Mock */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] sm:w-[130%] h-[90%] sm:h-[110%] bg-[#080705] border border-white/5 rounded-2xl flex p-4 gap-4 rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out shadow-2xl shadow-[#8B5E3C]/5">

              {/* Sidebar Abstrata */}
              <div className="w-16 sm:w-20 lg:w-24 h-full border-r border-white/5 hidden xs:flex flex-col gap-4 pr-4 pt-2">
                <div className="w-full aspect-square bg-white/[0.03] rounded-lg mb-8" />
                <div className="w-full h-4 bg-white/[0.03] rounded-sm" />
                <div className="w-3/4 h-4 bg-white/[0.03] rounded-sm" />
                <div className="w-5/6 h-4 bg-white/[0.03] rounded-sm" />
                <div className="w-full h-4 bg-white/[0.03] rounded-sm mt-auto" />
              </div>

              {/* Conteúdo Principal Abstrato */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="w-1/3 h-6 bg-white/[0.03] rounded-md mb-2" />

                <div className="grid grid-cols-3 gap-4 h-32 text-transparent">
                  <div className="col-span-1 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-white/[0.03] rounded-sm" />
                    <div className="w-3/4 h-6 bg-white/[0.03] rounded-sm" />
                  </div>
                  <div className="col-span-1 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-white/[0.03] rounded-sm" />
                    <div className="w-2/3 h-6 bg-white/[0.03] rounded-sm" />
                  </div>
                  <div className="col-span-1 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-white/[0.03] rounded-sm" />
                    <div className="w-1/2 h-6 bg-[#8B5E3C]/20 rounded-sm" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white/[0.03] border border-white/5 rounded-xl relative overflow-hidden flex flex-col justify-end p-4">
                    <div className="w-full bg-white/[0.03] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full w-[65%] bg-[#8B5E3C]/40" />
                    </div>
                    <div className="w-full h-1/2 mt-4 flex items-end gap-2">
                      <div className="flex-1 bg-white/[0.02] h-[40%] rounded-t-sm" />
                      <div className="flex-1 bg-white/[0.02] h-[60%] rounded-t-sm" />
                      <div className="flex-1 bg-[#8B5E3C]/10 h-[80%] rounded-t-sm" />
                      <div className="flex-1 bg-white/[0.02] h-[50%] rounded-t-sm" />
                      <div className="flex-1 bg-[#8B5E3C]/20 h-[100%] rounded-t-sm" />
                    </div>
                  </div>
                  <div className="col-span-1 border border-white/5 rounded-xl flex items-center justify-center bg-white/[0.01]">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[6px] border-[#8B5E3C]/10 border-t-[#8B5E3C]/50 border-r-[#8B5E3C]/30 rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Three Features Section (Asymmetric Grid) */}
        <section className="max-w-7xl mx-auto px-6 mt-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Feature 1 (Large 8 cols) */}
            <FeatureCard
              className="lg:col-span-8 min-h-[340px]"
              title="Distribuição Inteligente de Aportes"
              desc="O algoritmo analisa seu portfólio em milissegundos e sugere ordens de compra precisas para convergir com o alvo matemático escolhido."
            >
              <div className="absolute right-0 bottom-0 w-3/4 h-3/4 opacity-40 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-end p-6">
                <div className="w-full h-full border-b border-r border-[#8B5E3C]/20 flex items-end gap-3 p-4">
                  <div className="w-full bg-[#8B5E3C]/10 hover:bg-[#8B5E3C]/20 transition-colors h-[20%] rounded-t-sm" />
                  <div className="w-full bg-[#8B5E3C]/20 hover:bg-[#8B5E3C]/30 transition-colors h-[50%] rounded-t-sm" />
                  <div className="w-full bg-[#8B5E3C]/40 hover:bg-[#8B5E3C]/60 transition-colors h-[85%] rounded-t-sm" />
                  <div className="w-full bg-[#8B5E3C]/10 hover:bg-[#8B5E3C]/20 transition-colors h-[30%] rounded-t-sm" />
                </div>
              </div>
            </FeatureCard>

            {/* Feature 2 (Small 4 cols) */}
            <FeatureCard
              className="lg:col-span-4 min-h-[340px]"
              title="Preço-Teto Automático"
              desc="Define parâmetros rigorosos. O sistema bloqueia matematicamente sugestões de compra para ativos com preço irracional."
            >
              <div className="mt-auto pt-8">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080705] border border-white/5">
                  <span className="text-zinc-600 font-mono text-xs tracking-wider">STATUS</span>
                  <span className="text-[#8B5E3C] font-mono text-xs bg-[#8B5E3C]/10 px-2.5 py-1 rounded inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] animate-pulse" />
                    BLOQUEADA
                  </span>
                </div>
              </div>
            </FeatureCard>

            {/* Feature 3 (Large full width split look) */}
            <FeatureCard
              className="lg:col-span-12 min-h-[300px] flex-col md:flex-row items-start md:items-center gap-8"
              title="Projeção de Faturas"
              desc="Uma visão analítica clara de como os gastos em cartões hoje afetam sua liquidez nos próximos 12 meses, sem surpresas no fluxo de caixa."
            >
              <div className="flex-1 w-full h-full min-h-[160px] flex items-center justify-end md:pr-10 relative opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B5E3C]/5 to-transparent blur-2xl" />
                <div className="w-full max-w-sm space-y-3 relative z-10">
                  <div className="h-12 w-full bg-[#080705] border border-white/5 rounded-lg flex items-center px-4 justify-between">
                    <div className="h-2 w-16 bg-white/[0.05] rounded-full" />
                    <div className="h-2 w-24 bg-[#8B5E3C]/40 rounded-full" />
                  </div>
                  <div className="h-12 w-[90%] ml-auto bg-[#080705] border border-white/5 rounded-lg flex items-center px-4 justify-between translate-x-2">
                    <div className="h-2 w-16 bg-white/[0.05] rounded-full" />
                    <div className="h-2 w-20 bg-[#8B5E3C]/30 rounded-full" />
                  </div>
                  <div className="h-12 w-[80%] ml-auto bg-[#080705] border border-white/5 rounded-lg flex items-center px-4 justify-between translate-x-4">
                    <div className="h-2 w-16 bg-white/[0.05] rounded-full" />
                    <div className="h-2 w-12 bg-[#8B5E3C]/20 rounded-full" />
                  </div>
                </div>
              </div>
            </FeatureCard>

          </div>
        </section>

        {/* 4. Waitlist */}
        <section id="waitlist" className="max-w-3xl mx-auto px-6 mt-40 mb-20">
          <div className="p-8 sm:p-14 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden text-center">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#8B5E3C]/50 to-transparent" />

            <div className="relative z-10">
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-4 text-white">Acesso Antecipado</h2>
              <p className="text-zinc-400 text-lg mb-10 font-normal">
                Seja um dos primeiros a usar. Sem spam, sem compromisso.
              </p>

              {!subscribed ? (
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full mb-6">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      className="flex-1 h-12 px-5 rounded-xl bg-black border border-white/10 focus:border-[#8B5E3C]/60 focus:ring-1 focus:ring-[#8B5E3C]/60 outline-none text-zinc-100 placeholder:text-zinc-600 transition-all font-medium text-sm"
                    />
                    <button
                      type="submit"
                      className="h-12 px-8 rounded-xl bg-[#8B5E3C] hover:bg-[#9a6a45] text-white font-semibold transition-all active:scale-95 whitespace-nowrap text-sm"
                    >
                      Garantir Vaga
                    </button>
                  </form>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Ao se inscrever, você concorda com nossos Termos e nossa Política de Privacidade baseada na LGPD.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 text-zinc-300 bg-black/40 border border-white/5 py-4 px-6 rounded-2xl mx-auto max-w-md animate-in zoom-in-95 duration-300">
                  <CheckCircle2 className="h-5 w-5 text-[#8B5E3C]" />
                  <span className="text-sm font-medium">Entramos em contato assim que abrirmos vagas.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6 items-center justify-center">
          <div className="text-zinc-600 font-medium text-sm">
            Feito no Brasil · 2026
          </div>
          <div className="flex gap-6 text-xs text-zinc-500 font-medium">
            <a href="#" className="hover:text-zinc-300 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Política de Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, children, className }: { title: string, desc: string, children?: React.ReactNode, className?: string }) {
  const { setRef, isInView } = useInView({ threshold: 0.2 })

  return (
    <div
      ref={(el) => setRef(el)}
      className={cn(
        "p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#8B5E3C]/40 transition-all duration-500 group relative overflow-hidden flex",
        "opacity-0 translate-y-8",
        isInView && "opacity-100 translate-y-0",
        className
      )}
    >
      <div className="relative z-10 max-w-sm shrink-0">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white tracking-tight">{title}</h3>
        <p className="text-zinc-400 font-normal leading-relaxed text-sm sm:text-base">{desc}</p>
      </div>
      {children}
    </div>
  )
}
