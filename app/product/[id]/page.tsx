"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ProductDetail from "@/components/product-detail"
import { Spinner } from "@/components/ui/spinner"

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock product data - same as home page for consistency
    const mockProducts: Record<string, Product> = {
      "1": {
        id: "1",
        name: "Camiseta Azul",
        price: 50000,
        image: "/blue-shirt.png",
        description: "Camiseta de algodón azul de alta calidad. Perfecta para uso diario. Material cómodo y duradero.",
        category: "Ropa",
      },
      "2": {
        id: "2",
        name: "Pantalones Negro",
        price: 75000,
        image: "/black-pants.png",
        description: "Pantalones negros de mezclilla resistentes. Talla única. Diseño clásico y versátil.",
        category: "Ropa",
      },
      "3": {
        id: "3",
        name: "Repuesto Motor",
        price: 150000,
        image: "/generic-car-part.png",
        description: "Repuesto original para motor. Garantizado por el fabricante. Entrega inmediata.",
        category: "Repuestos",
      },
      "4": {
        id: "4",
        name: "Encomienda USA",
        price: 25000,
        image: "/wrapped-parcel.png",
        description: "Servicio de encomienda desde USA. Entrega en 7-10 días. Rastreo incluido.",
        category: "Encomiendas",
      },
    }

    setProduct(mockProducts[params.id] || null)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Spinner />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-8">El producto que buscas no existe o fue eliminado.</p>
            <Link
              href="/"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-yellow-400 hover:text-yellow-500 font-semibold mb-8 transition"
        >
          ← Volver a la tienda
        </Link>

        <ProductDetail product={product} />
      </div>
    </main>
  )
}
