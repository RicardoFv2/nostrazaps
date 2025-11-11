"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-card border-t border-border">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Únete al futuro del comercio local ⚡</h2>

        <p className="text-lg text-foreground/70 mb-10 max-w-xl mx-auto">
          Comienza a comprar y vender con confianza hoy mismo
        </p>

        <Button
          size="lg"
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
        >
          <Link href="/">Empezar ahora</Link>
        </Button>
      </div>
    </section>
  )
}
