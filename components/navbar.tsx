"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="text-2xl">⚡</span>
          TurboZaps
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/marketplace" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Explorar
          </Link>
          <a href="/#como-funciona" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Cómo funciona
          </a>
          <a href="/#features" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Características
          </a>
          <Link
            href="/sell"
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Publicar
          </Link>
          <Link
            href="/select-role"
            className="border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            Panel
          </Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded hover:bg-muted">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border md:hidden">
            <div className="flex flex-col gap-4 p-4">
              <Link href="/" className="text-foreground hover:text-primary">
                Inicio
              </Link>
              <Link href="/marketplace" className="text-foreground hover:text-primary">
                Explorar productos
              </Link>
              <Link href="/sell" className="text-foreground hover:text-primary">
                Publicar anuncio
              </Link>
              <Link href="/select-role" className="text-foreground hover:text-primary">
                Panel
              </Link>
              <a href="/#como-funciona" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Cómo funciona
              </a>
              <a href="/#features" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Características
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
