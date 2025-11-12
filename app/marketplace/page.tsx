"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import { Spinner } from "@/components/ui/spinner"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        
        if (data.ok && Array.isArray(data.products)) {
          // Transform products to match interface
          const transformedProducts = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price_sats || p.price || 0,
            image: p.image || "/placeholder.svg",
            category: p.category || "Otros",
          }))
          setProducts(transformedProducts)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading products")
        // Fallback to empty array if API fails
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Compra y vende con Bitcoin Lightning</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
