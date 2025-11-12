"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import ProductForm from "@/components/product-form"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

export default function SellPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [stallId, setStallId] = useState<string | null>(null)

  useEffect(() => {
    // Verificar que el merchant esté logueado
    const isMerchantLoggedIn = localStorage.getItem('is_merchant_logged_in')
    const merchantNpub = localStorage.getItem('merchant_npub')
    const storedStallId = localStorage.getItem('stall_id')

    if (!isMerchantLoggedIn || !merchantNpub) {
      router.push('/register/merchant')
      return
    }

    if (storedStallId) {
      setStallId(storedStallId)
      loadProducts(storedStallId)
    } else {
      // Si no hay stall_id, intentar obtenerlo de los stalls
      loadStallId()
    }
  }, [router])

  const loadStallId = async () => {
    try {
      const response = await fetch('/api/stalls')
      const data = await response.json()
      if (data.ok) {
        const stalls = Array.isArray(data.stalls) ? data.stalls : [data.stall].filter(Boolean)
        if (stalls.length > 0) {
          const firstStall = stalls[0]
          const stallId = firstStall.id || ''
          localStorage.setItem('stall_id', stallId)
          setStallId(stallId)
          loadProducts(stallId)
        }
      }
    } catch (error) {
      console.error('Error loading stall:', error)
      setLoading(false)
    }
  }

  const loadProducts = async (stallIdToLoad: string) => {
    try {
      setLoading(true)
      console.log('[SellPage] Loading products for stall:', stallIdToLoad)
      const response = await fetch(`/api/products/stall/${stallIdToLoad}`)
      const data = await response.json()

      console.log('[SellPage] Products response:', data)

      if (data.ok) {
        // Handle both array and single product responses
        const productsArray = Array.isArray(data.products) 
          ? data.products 
          : (data.products ? [data.products] : [])
        
        // Transform products from NostrMarket format
        const transformedProducts = productsArray.map((p: any) => ({
          id: p.id || p.product_id || '',
          name: p.name || '',
          price: p.price || p.config?.price || 0,
          image: Array.isArray(p.images) && p.images.length > 0 
            ? p.images[0] 
            : '/placeholder.svg',
          category: Array.isArray(p.categories) && p.categories.length > 0
            ? p.categories[0]
            : 'Otros',
        }))
        
        console.log('[SellPage] Transformed products:', transformedProducts)
        setProducts(transformedProducts)
      } else {
        console.warn('[SellPage] Products response not ok:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('[SellPage] Error loading products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleProductCreated = async () => {
    setShowForm(false)
    if (stallId) {
      // Agregar un pequeño delay para dar tiempo a NostrMarket de procesar el producto
      await new Promise(resolve => setTimeout(resolve, 1000))
      await loadProducts(stallId)
    }
  }

  if (!stallId && !loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No se encontró tu tienda</h1>
          <p className="text-muted-foreground mb-6">
            Necesitas crear una tienda primero para poder agregar productos.
          </p>
          <Button onClick={() => router.push('/register/merchant')}>
            Crear Tienda
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mis Productos</h1>
            <p className="text-muted-foreground">Gestiona tus productos en NostrMarket</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Ver Productos' : 'Nuevo Producto'}
          </Button>
        </div>

        {showForm ? (
          <div className="mb-8">
            <ProductForm onProductCreated={handleProductCreated} />
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground mb-4">No tienes productos aún</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Producto
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

