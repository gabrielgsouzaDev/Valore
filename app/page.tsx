"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

function CountUp({ end, duration = 1500 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0)
  const { setRef, isInView } = useInView({ threshold: 0.5 })

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(ease * end))
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step)
      }
    }
    animationFrame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [isInView, end, duration])

  return <span ref={setRef as any}>{count}</span>
  return <span ref={setRef as any}>{count}</span>
}

function PainCard({ pain, index }: { pain: { step: string; title: string; desc: string }, index: number }) {
  const { setRef, isInView } = useInView()
  return (
    <div
      ref={setRef as any}
      className={cn(
        "p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors",
        "opacity-0 translate-y-4 duration-400 transition-all",
        isInView && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-4xl font-extrabold text-white/10 mb-6 font-mono tracking-tighter">{pain.step}</div>
      <h3 className="text-xl font-bold mb-3">{pain.title}</h3>
      <p className="text-zinc-400 leading-relaxed font-medium">{pain.desc}</p>
    </div>
  )
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
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans overflow-x-hidden selection:bg-[#8B5E3C]/30">
      {/* Header Mini */}
      <header className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[#8B5E3C] rotate-45" />
            <span className="font-bold text-xl tracking-tight">Valore</span>
          </div>
        </div>
      </header>

      <main className="pt-24 sm:pt-32 pb-20">
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-both delay-75">
              <span className="flex h-2 w-2 rounded-full bg-[#8B5E3C] animate-pulse" />
              Gratuito durante o beta
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-300 fill-mode-both delay-150 text-white">
                Inteligência institucional para seu <span className="text-[#8B5E3C]">patrimônio.</span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-400 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-300 fill-mode-both delay-200 font-medium">
                Seu painel financeiro completo: acompanhe investimentos, controle gastos, planeje objetivos e entenda seu net worth em tempo real.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-300 fill-mode-both delay-300">
              <a href="#waitlist" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2">
                Entrar na Lista de Espera
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/app" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide transition-all text-center">
                Ver Demo
              </Link>
            </div>
          </div>

          <div className="hidden sm:block relative w-full aspect-square md:aspect-[4/3] lg:aspect-square animate-in fade-in zoom-in-95 duration-500 fill-mode-both delay-300">
            {/* Abstract Dashboard Mock */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5E3C]/10 to-transparent rounded-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col p-4 gap-4 rotate-[-2deg] skew-y-1 hover:rotate-0 hover:skew-y-0 transition-transform duration-500">
              <div className="h-4 w-1/3 bg-white/5 rounded-md" />
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white/5 xl:rounded-xl border border-white/5 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#8B5E3C]/20 to-transparent" />
                </div>
                <div className="col-span-1 flex flex-col gap-4">
                  <div className="h-1/2 bg-white/5 xl:rounded-xl border border-white/5" />
                  <div className="h-1/2 bg-white/5 xl:rounded-xl border border-white/5 flex items-center justify-center p-4">
                    <div className="w-full h-full rounded-full border-4 border-[#8B5E3C]/50 border-t-[#8B5E3C]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Problema Section */}
        <section className="max-w-7xl mx-auto px-6 mt-32">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Onde os métodos tradicionais falham</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Falta de Escala", desc: "Planilhas quebram, ficam lentas e exigem manutenção manual constante. O Valore escala com o seu capital." },
              { step: "02", title: "Decisões no Escuro", desc: "Decidir onde aportar para rebalancear a carteira exige tempo. Nossa distribuição inteligente resolve numa fração de segundo." },
              { step: "03", title: "Visão Fragmentada", desc: "Bancos e corretoras não conversam. Centralize ativos e projete faturas em um ecossistema único offline-first." }
            ].map((pain, i) => (
              <PainCard key={i} pain={pain} index={i} />
            ))}
          </div>
        </section>

        {/* 3. Features Section (Asymmetric) */}
        <section className="max-w-7xl mx-auto px-6 mt-40">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Arquitetura paramétrica.</h2>
            <p className="text-xl text-zinc-400 font-medium">Funcionalidades modeladas para investidores que demandam mais que um simples agregador.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Feature 1 (Large) */}
            <div className="md:col-span-8 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#8B5E3C]/50 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              <div className="relative z-10 max-w-md">
                <h3 className="text-2xl font-bold mb-3">Distribuição Inteligente</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">Algoritmo de rebalanceamento preditivo. Escolha entre método Proporcional ou em Cascata para otimizar seus aportes automaticamente.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 opacity-30 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-end p-6">
                <div className="w-full border-b border-r border-[#8B5E3C]/30 flex items-end gap-2 p-4">
                  <div className="w-1/4 bg-[#8B5E3C]/20 h-1/3" />
                  <div className="w-1/4 bg-[#8B5E3C]/40 h-2/3" />
                  <div className="w-1/4 bg-[#8B5E3C]/60 h-full" />
                </div>
              </div>
            </div>

            {/* Feature 2 (Small) */}
            <div className="md:col-span-4 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#8B5E3C]/50 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-xl font-bold mb-3">Preço-Teto Automático</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">Defina tetos de compra e deixe o sistema barrar ordens caras.</p>
              </div>
              <div className="mt-8 flex items-center justify-between p-3 rounded-lg bg-black/50 border border-white/5">
                <span className="text-zinc-500 font-mono text-xs">STATUS DA COMPRA</span>
                <span className="text-[#8B5E3C] font-mono text-xs bg-[#8B5E3C]/10 px-2 py-1 rounded inline-flex items-center gap-1.5 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] animate-pulse" /> BLOQUEADA</span>
              </div>
            </div>

            {/* Feature 3 (Small) */}
            <div className="md:col-span-5 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#8B5E3C]/50 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col justify-between min-h-[250px]">
              <div>
                <h3 className="text-xl font-bold mb-3">Projeção de Faturas</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">Avalie o impacto futuro dos cartões no seu fluxo de caixa.</p>
              </div>
            </div>

            {/* Feature 4 (Medium) */}
            <div className="md:col-span-7 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#8B5E3C]/50 hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">19 Temas Premium</h3>
                <p className="text-zinc-400 font-medium leading-relaxed max-w-sm">Do Paper ao AMOLED. PWA Instalável adaptado à sua identidade, preservado em cache offline.</p>
              </div>
              <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-[#8B5E3C]/10 blur-[100px] group-hover:bg-[#8B5E3C]/20 transition-colors duration-400" />
            </div>
          </div>
        </section>

        {/* 4. Social Proof */}
        <section className="max-w-5xl mx-auto px-6 mt-40 text-center">
          <div className="py-16 border-y border-white/5">
            <div className="text-6xl sm:text-8xl font-black text-white/50 mb-4 font-mono">
              <CountUp end={50} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Primeiros usuários no acesso antecipado</h2>
          </div>
        </section>

        {/* 5. Pricing Teaser */}
        <section id="waitlist" className="max-w-3xl mx-auto px-6 mt-40 mb-20 text-center">
          <div className="p-8 sm:p-12 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Acesso antecipado gratuito</h2>
              <p className="text-zinc-400 text-lg mb-8 font-medium">
                Garanta seu lugar no lançamento e participe da construção do melhor painel financeiro.
              </p>

              {!subscribed ? (
                <div className="flex flex-col gap-3 max-w-lg mx-auto">
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu.melhor@email.com"
                      required
                      className="flex-1 h-12 px-4 rounded-xl bg-black border border-white/10 focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] outline-none text-zinc-100 placeholder:text-zinc-600 transition-all font-medium"
                    />
                    <button
                      type="submit"
                      className="h-12 px-6 rounded-xl bg-[#8B5E3C] hover:bg-[#8B5E3C] text-black font-bold transition-all focus:scale-95 whitespace-nowrap"
                    >
                      Garantir Vaga
                    </button>
                  </form>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Tratamento de dados em conformidade com a LGPD. Zero spam.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-[#8B5E3C] font-bold animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="h-6 w-6" />
                  <span>Vaga reservada com sucesso. Fique de olho na caixa de entrada.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-zinc-800 rotate-45" />
            <span className="font-bold text-lg tracking-tight text-zinc-300">Valore</span>
          </div>
          <div className="text-zinc-500 font-medium text-sm text-center">
            Feito no Brasil para investidores brasileiros.
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Termos</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
