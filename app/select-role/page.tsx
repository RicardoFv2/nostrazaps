"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Store } from "lucide-react"

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller" | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">⚡ TurboZaps</h1>
          <p className="text-white/90 text-lg">Elige tu rol para comenzar</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Card */}
          <button
            onClick={() => setSelectedRole("buyer")}
            className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${
              selectedRole === "buyer"
                ? "bg-white shadow-2xl scale-105"
                : "bg-white/90 hover:bg-white shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Comprador</h2>
              <p className="text-foreground/70 text-sm">
                Compra productos seguros con pagos protegidos en Lightning Network.
              </p>
              <ul className="text-sm text-foreground/60 space-y-1 text-left">
                <li>✓ Ver productos disponibles</li>
                <li>✓ Comunicarse con vendedores</li>
                <li>✓ Confirmar entregas</li>
              </ul>
            </div>
          </button>

          {/* Seller Card */}
          <button
            onClick={() => setSelectedRole("seller")}
            className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${
              selectedRole === "seller"
                ? "bg-white shadow-2xl scale-105"
                : "bg-white/90 hover:bg-white shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Vendedor</h2>
              <p className="text-foreground/70 text-sm">
                Vende tus productos a la comunidad con transacciones seguras.
              </p>
              <ul className="text-sm text-foreground/60 space-y-1 text-left">
                <li>✓ Publicar productos</li>
                <li>✓ Gestionar ventas</li>
                <li>✓ Recibir pagos en sats</li>
              </ul>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full border-white text-white hover:bg-white/10 bg-transparent">
              ← Volver
            </Button>
          </Link>
          <Link
            href={selectedRole === "buyer" ? "/dashboard/buyer" : selectedRole === "seller" ? "/dashboard/seller" : "#"}
            className="flex-1"
          >
            <Button disabled={!selectedRole} className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
              Continuar →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
