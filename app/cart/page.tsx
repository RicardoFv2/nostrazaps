"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch {
        setCart([])
      }
    }
    setLoading(false)
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id)
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  const updateQuantity = (id: string, quantity: number) => {
    const updated = cart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Volver
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-8">Carrito de Compras</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">Tu carrito está vacío</p>
            <Link href="/">
              <Button>Continuar comprando</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4 flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-20 h-20 rounded object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-primary">{item.price.toLocaleString()} sats</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 border border-border rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 border border-border rounded"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-destructive text-sm">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg p-6 h-fit">
              <h2 className="text-xl font-semibold text-foreground mb-4">Resumen</h2>
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{total.toLocaleString()} sats</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-foreground text-lg mb-6">
                <span>Total</span>
                <span>{total.toLocaleString()} sats</span>
              </div>
              <Button className="w-full">Proceder al pago</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
