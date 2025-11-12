"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EscrowsTable, type Escrow } from "@/components/escrows-table"
import { EscrowChat } from "@/components/escrow-chat"
import { generateMockNostrPubkey, ensureValidNostrPubkey } from "@/lib/utils"
import { Store, TrendingUp, History } from "lucide-react"

const navItems = [
  { label: "Mis ventas", href: "/dashboard/seller", icon: <Store className="w-5 h-5" /> },
  { label: "Estadísticas", href: "/dashboard/seller/stats", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Historial", href: "/dashboard/seller/history", icon: <History className="w-5 h-5" /> },
]

export default function SellerDashboard() {
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [loading, setLoading] = useState(true)
  const [sellerPubkey, setSellerPubkey] = useState<string>("")

  // Get seller pubkey from merchant API or localStorage (ensure it's in hexadecimal format)
  useEffect(() => {
    const loadSellerPubkey = async () => {
      try {
        // First, try to get pubkey from merchant API
        const merchantResponse = await fetch('/api/merchants')
        const merchantData = await merchantResponse.json()
        
        if (merchantData.ok && merchantData.merchant?.public_key) {
          // Validate and normalize the merchant's public key
          const validPubkey = ensureValidNostrPubkey(merchantData.merchant.public_key, false)
          if (validPubkey) {
            setSellerPubkey(validPubkey)
            localStorage.setItem('seller_pubkey', validPubkey)
            return
          }
        }
      } catch (error) {
        console.error('Error loading merchant:', error)
      }

      // Fallback to localStorage or generate new key
      let pubkey = localStorage.getItem('seller_pubkey')
      // Validate and normalize the key, or generate a new one if invalid
      const validPubkey = ensureValidNostrPubkey(pubkey, true)
      if (validPubkey) {
        // Store the valid key (overwrite if it was invalid)
        if (pubkey !== validPubkey) {
          localStorage.setItem('seller_pubkey', validPubkey)
        }
        setSellerPubkey(validPubkey)
      } else {
        // Generate a new valid key
        const newPubkey = generateMockNostrPubkey()
        localStorage.setItem('seller_pubkey', newPubkey)
        setSellerPubkey(newPubkey)
      }
    }

    loadSellerPubkey()
  }, [])

  // Load orders from API (for seller, we need to get orders for products they own)
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        // Get all orders and filter by seller's products
        const response = await fetch('/api/orders')
        const data = await response.json()

        if (data.ok && Array.isArray(data.orders)) {
          // Get products to match with orders
          const productResponse = await fetch('/api/products')
          const productData = await productResponse.json()

          // Filter orders for products that belong to this seller
          // In a real app, you'd filter by stall_id or seller_pubkey
          const sellerOrders = data.orders.filter((order: any) => {
            // For now, we'll show all orders. In production, filter by seller's products
            return true
          })

          // Transform orders to escrows format
          const transformedEscrows: Escrow[] = await Promise.all(
            sellerOrders.map(async (order: any) => {
              // Get product info
              let productName = "Producto desconocido"
              if (productData.ok) {
                const product = productData.products.find((p: any) => p.id === order.product_id)
                if (product) productName = product.name
              }

              // Map status
              let status: Escrow["status"] = "pending_payment"
              if (order.status === "paid") status = "in_escrow"
              else if (order.status === "released") status = "released"
              else if (order.status === "cancelled" || order.status === "refunded") status = "cancelled"

              return {
                id: parseInt(order.id.replace(/-/g, '').substring(0, 8), 16) || Math.random(),
                product: productName,
                amount: order.total_sats || 0,
                status,
                buyerName: "Cliente",
                sellerName: "Tú",
                createdAt: new Date(order.created_at).toISOString().split('T')[0],
                orderId: order.id,
                buyerPubkey: order.buyer_pubkey,
              }
            })
          )
          setEscrows(transformedEscrows)
        }
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleRelease = async () => {
    if (!selectedEscrow || !selectedEscrow.orderId) return

    try {
      const response = await fetch(`/api/orders/${selectedEscrow.orderId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.ok) {
        setEscrows(escrows.map((e) => (e.id === selectedEscrow.id ? { ...e, status: "released" as const } : e)))
        setSelectedEscrow(null)
      } else {
        throw new Error(data.error || 'Error al liberar el pago')
      }
    } catch (error) {
      console.error('Error releasing payment:', error)
      alert(error instanceof Error ? error.message : "Error al liberar el pago")
    }
  }

  const handleCancel = async () => {
    if (!selectedEscrow || !selectedEscrow.orderId) return

    try {
      const response = await fetch(`/api/orders/${selectedEscrow.orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.ok) {
        setEscrows(escrows.map((e) => (e.id === selectedEscrow.id ? { ...e, status: "cancelled" as const } : e)))
        setSelectedEscrow(null)
      } else {
        throw new Error(data.error || 'Error al cancelar la transacción')
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error)
      alert(error instanceof Error ? error.message : "Error al cancelar la transacción")
    }
  }

  return (
    <DashboardLayout role="seller" navItems={navItems}>
      {!selectedEscrow ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mis Ventas</h1>
            <p className="text-muted-foreground">Gestiona tus transacciones y escrows en espera</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">En escrow</p>
              <p className="text-2xl font-bold text-foreground">
                {escrows.filter((e) => e.status === "in_escrow").length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">Total liberado (sats)</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {escrows
                  .filter((e) => e.status === "released")
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">Transacciones</p>
              <p className="text-2xl font-bold text-foreground">{escrows.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <EscrowsTable escrows={escrows} role="seller" onSelectEscrow={setSelectedEscrow} />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedEscrow(null)}
            className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2"
          >
            ← Volver a mis ventas
          </button>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">{selectedEscrow.product}</h2>
            {/* Validate buyer pubkey before rendering EscrowChat */}
            {selectedEscrow.orderId && selectedEscrow.buyerPubkey ? (
              <EscrowChat
                productName={selectedEscrow.product}
                orderId={selectedEscrow.orderId}
                buyerPubkey={ensureValidNostrPubkey(selectedEscrow.buyerPubkey, false) || selectedEscrow.buyerPubkey}
                sellerPubkey={sellerPubkey}
                buyerName={selectedEscrow.buyerName}
                sellerName="Tú"
                onRelease={handleRelease}
                onCancel={handleCancel}
                isBuyer={false}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Error: No se pudo cargar la información del comprador.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
