"use client"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ProductForm from "@/components/product-form"

export default function SellPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Volver
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Publicar Producto</h1>
          <p className="text-muted-foreground">Comparte tu producto con la comunidad</p>
        </div>

        <ProductForm />
      </div>
    </main>
  )
}
