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
        const res = await fetch("https://kkotrack-backend.vercel.app/api/products")
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading products")
        // Mock data for demo
        setProducts([
          { id: "1", name: "Camiseta Azul", price: 50000, image: "/blue-shirt.png", category: "Ropa" },
          { id: "2", name: "Pantalones Negro", price: 75000, image: "/black-pants.png", category: "Ropa" },
          {
            id: "3",
            name: "Repuesto Motor",
            price: 150000,
            image: "/generic-car-part.png",
            category: "Repuestos",
          },
          {
            id: "4",
            name: "Encomienda USA",
            price: 25000,
            image: "/wrapped-parcel.png",
            category: "Encomiendas",
          },
        ])
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
