"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-2 border border-accent/30">
          <span className="text-sm font-medium text-accent">Revolucionando el comercio local</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
          Comercio informal,
          <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ahora con confianza ⚡
          </span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto text-pretty">
          Compra y vende artículos usados, encomiendas o ropa con pagos Lightning seguros mediante escrow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/">Explorar productos</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-primary/5 bg-transparent"
          >
            <Link href="/">Publicar anuncio</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
