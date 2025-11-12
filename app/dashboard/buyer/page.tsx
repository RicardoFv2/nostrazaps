"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EscrowsTable, type Escrow } from "@/components/escrows-table"
import { EscrowChat } from "@/components/escrow-chat"
import { generateMockNostrPubkey, ensureValidNostrPubkey } from "@/lib/utils"
import { ShoppingCart, History } from "lucide-react"

const navItems = [
  { label: "Mis compras", href: "/dashboard/buyer", icon: <ShoppingCart className="w-5 h-5" /> },
  { label: "Historial", href: "/dashboard/buyer/history", icon: <History className="w-5 h-5" /> },
]

export default function BuyerDashboard() {
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [loading, setLoading] = useState(true)
  const [buyerPubkey, setBuyerPubkey] = useState<string>("")
  const [sellerPubkey, setSellerPubkey] = useState<string | null>(null)

  // Get buyer pubkey from localStorage (ensure it's in hexadecimal format)
  useEffect(() => {
    let pubkey = localStorage.getItem('buyer_pubkey')
    // Validate and normalize the key, or generate a new one if invalid
    const validPubkey = ensureValidNostrPubkey(pubkey, true)
    if (validPubkey) {
      // Store the valid key (overwrite if it was invalid)
      if (pubkey !== validPubkey) {
        localStorage.setItem('buyer_pubkey', validPubkey)
      }
      setBuyerPubkey(validPubkey)
    } else {
      // Generate a new valid key
      const newPubkey = generateMockNostrPubkey()
      localStorage.setItem('buyer_pubkey', newPubkey)
      setBuyerPubkey(newPubkey)
    }
  }, [])

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      if (!buyerPubkey) return

      try {
        setLoading(true)
        const response = await fetch(`/api/orders?buyer_pubkey=${encodeURIComponent(buyerPubkey)}`)
        const data = await response.json()

        if (data.ok && Array.isArray(data.orders)) {
          // Transform orders to escrows format
          const transformedEscrows: Escrow[] = await Promise.all(
            data.orders.map(async (order: any) => {
              // Get product info
              let productName = "Producto desconocido"
              try {
                const productResponse = await fetch(`/api/products`)
                const productData = await productResponse.json()
                if (productData.ok) {
                  const product = productData.products.find((p: any) => p.id === order.product_id)
                  if (product) productName = product.name
                }
              } catch (error) {
                console.error('Error loading product:', error)
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
                buyerName: "Tú",
                sellerName: "Vendedor",
                createdAt: new Date(order.created_at).toISOString().split('T')[0],
                orderId: order.id,
                sellerPubkey: order.seller_pubkey || null, // Include seller pubkey if available
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
  }, [buyerPubkey])

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
    <DashboardLayout role="buyer" navItems={navItems}>
      {!selectedEscrow ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mis Compras</h1>
            <p className="text-muted-foreground">Gestiona tus transacciones y escrows activos</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <EscrowsTable escrows={escrows} role="buyer" onSelectEscrow={setSelectedEscrow} />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedEscrow(null)}
            className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2"
          >
            ← Volver a mis compras
          </button>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">{selectedEscrow.product}</h2>
            {/* Load seller pubkey from order when escrow is selected */}
            {selectedEscrow.orderId && (
              <EscrowChatLoader
                orderId={selectedEscrow.orderId}
                buyerPubkey={buyerPubkey}
                selectedEscrow={selectedEscrow}
                onRelease={handleRelease}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// Component to load seller pubkey from order and render EscrowChat
function EscrowChatLoader({
  orderId,
  buyerPubkey,
  selectedEscrow,
  onRelease,
  onCancel,
}: {
  orderId: string
  buyerPubkey: string
  selectedEscrow: Escrow
  onRelease: () => void
  onCancel: () => void
}) {
  const [sellerPubkey, setSellerPubkey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        // Get order to retrieve seller_pubkey
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()

        if (data.ok && data.order) {
          // Get seller pubkey from order, or try to get it from merchant
          let pubkey = data.order.seller_pubkey
          
          if (!pubkey) {
            // Try to get seller pubkey from merchant
            try {
              const merchantResponse = await fetch('/api/merchants')
              const merchantData = await merchantResponse.json()
              if (merchantData.ok && merchantData.merchant) {
                pubkey = merchantData.merchant.public_key
              }
            } catch (error) {
              console.error('Error loading merchant:', error)
            }
          }

          // Validate and normalize the key
          if (pubkey) {
            const validPubkey = ensureValidNostrPubkey(pubkey, false)
            if (validPubkey) {
              setSellerPubkey(validPubkey)
            } else {
              console.warn('[EscrowChatLoader] Invalid seller pubkey format:', pubkey.substring(0, 20))
            }
          }
        }
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <EscrowChat
      productName={selectedEscrow.product}
      orderId={orderId}
      buyerPubkey={buyerPubkey}
      sellerPubkey={sellerPubkey || undefined}
      buyerName="Tú"
      sellerName={selectedEscrow.sellerName}
      onRelease={onRelease}
      onCancel={onCancel}
      isBuyer={true}
    />
  )
}
