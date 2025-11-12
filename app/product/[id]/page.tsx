"use client"

import { useState, useEffect, use } from "react"
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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        
        if (data.ok && Array.isArray(data.products)) {
          const foundProduct = data.products.find((p: any) => p.id === id)
          if (foundProduct) {
            setProduct({
              id: foundProduct.id,
              name: foundProduct.name,
              price: foundProduct.price_sats || foundProduct.price || 0,
              image: foundProduct.image || "/placeholder.svg",
              description: foundProduct.description || "",
              category: foundProduct.category || "Otros",
            })
          } else {
            setProduct(null)
          }
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

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
