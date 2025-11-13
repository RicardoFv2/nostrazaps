"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LightningPaymentModal } from "@/components/lightning-payment-modal"
import { LightningInvoiceModal } from "@/components/lightning-invoice-modal"
import { EscrowChat } from "@/components/escrow-chat"
import { EscrowStatusBadge } from "@/components/escrow-status-badge"

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}

interface ProductDetailProps {
  product: Product
}

type EscrowStatus = "pending" | "paid" | "released" | "cancelled"

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>("pending")
  const [purchasing, setPurchasing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [invoice, setInvoice] = useState("")

  const [orderId, setOrderId] = useState<string | null>(null)
  const [buyerPubkey, setBuyerPubkey] = useState<string>("")
  const [sellerPubkey, setSellerPubkey] = useState<string>("")

  // Get buyer pubkey from localStorage or redirect to registration
  useEffect(() => {
    const pubkey = localStorage.getItem('buyer_pubkey')
    if (!pubkey) {
      // No buyer profile, redirect to registration
      if (typeof window !== 'undefined') {
        const shouldRegister = confirm('Necesitas crear un perfil de comprador para realizar compras. ¿Deseas registrarte ahora?')
        if (shouldRegister) {
          window.location.href = '/register/buyer'
        }
      }
      return
    }
    setBuyerPubkey(pubkey)
  }, [])

  // Get seller pubkey - in production this would come from the product/stall owner
  useEffect(() => {
    // Try to get from merchant localStorage (if viewing as merchant)
    const merchantPubkey = localStorage.getItem('merchant_public_key')
    
    // For MVP, we use merchant_public_key if available
    // In production, this would be fetched from the product's stall owner
    if (merchantPubkey) {
      setSellerPubkey(merchantPubkey)
    } else {
      // Generate a default seller pubkey for demo
      // In production, this would be fetched from the product API
      const defaultSellerPubkey = "a".repeat(64) // Mock hex pubkey
      setSellerPubkey(defaultSellerPubkey)
      console.warn('[ProductDetail] Using default seller pubkey for demo. In production, fetch from product/stall owner.')
    }
  }, [])

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          buyer_pubkey: buyerPubkey,
        }),
      })

      const data = await response.json()

      // Check if buyer role is missing (403 status)
      if (!response.ok && response.status === 403 && data.error?.includes('Buyer role not found')) {
        // Redirect to buyer registration page
        alert('Necesitas crear un perfil de comprador antes de realizar una compra. Serás redirigido a la página de registro.')
        router.push('/register/buyer')
        return
      }

      if (!data.ok) {
        throw new Error(data.error || 'Error al crear la orden')
      }

      // Store order ID
      setOrderId(data.order_id)

      // Get payment request from response
      if (data.payment_request) {
        setInvoice(data.payment_request)
        setShowPaymentModal(true)
      } else {
        throw new Error('No se pudo generar el invoice de pago')
      }
    } catch (error) {
      console.error("Error creating order:", error)
      // Only show alert if it's not a buyer role error (already handled above)
      if (!(error instanceof Error && error.message.includes('Buyer role not found'))) {
        alert(error instanceof Error ? error.message : "Error al procesar la compra")
      }
    } finally {
      setPurchasing(false)
    }
  }

  const handlePaymentConfirm = async () => {
    setShowPaymentModal(false)
    setEscrowStatus("paid")
    
    // Update order status to paid in LNbits
    if (orderId) {
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paid: true,
          }),
        })
      } catch (error) {
        console.error('Error updating order status:', error)
      }
    }
  }

  const handleReleasePayment = async (sellerInvoice: string) => {
    if (!orderId) return
    
    try {
      const response = await fetch(`/api/orders/${orderId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_payment_request: sellerInvoice,
          message: 'Buyer confirmed delivery',
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setEscrowStatus("released")
        alert(`✅ ${data.message}\nMonto enviado: ${data.amount_sent} sats`)
      } else {
        throw new Error(data.error || 'Error al liberar el pago')
      }
    } catch (error) {
      console.error('Error releasing payment:', error)
      throw error // Re-throw to be handled by modal
    }
  }

  const handleCancelTransaction = async (buyerInvoice: string) => {
    if (!orderId) return
    
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_payment_request: buyerInvoice,
          message: 'Seller agreed to refund',
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setEscrowStatus("cancelled")
        alert(`✅ ${data.message}\nMonto reembolsado: ${data.amount_refunded} sats`)
      } else {
        throw new Error(data.error || 'Error al cancelar la transacción')
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error)
      throw error // Re-throw to be handled by modal
    }
  }

  // Show different UI based on escrow status
  if (escrowStatus === "released") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-center justify-center">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full max-w-md rounded-xl border border-border shadow-lg object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
            <EscrowStatusBadge status="released" />
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">Pago liberado al vendedor</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              La transacción se completó exitosamente. Gracias por comprar en TurboZaps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (escrowStatus === "cancelled") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-center justify-center">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full max-w-md rounded-xl border border-border shadow-lg object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
            <EscrowStatusBadge status="cancelled" />
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Transacción cancelada</p>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              El dinero ha sido devuelto a tu billetera Lightning.
            </p>
            <Button
              onClick={() => setEscrowStatus("pending")}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (escrowStatus === "paid") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full max-w-md rounded-xl border border-border shadow-lg object-cover"
            />
          </div>

          <div>
            <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-yellow-400 mb-6">{product.price.toLocaleString()} sats</p>
            <EscrowStatusBadge status="paid" />
          </div>
        </div>

        <EscrowChat
          productName={product.name}
          orderId={orderId || ""}
          buyerPubkey={buyerPubkey}
          sellerPubkey={sellerPubkey}
          onRelease={() => setShowReleaseModal(true)}
          onCancel={() => setShowRefundModal(true)}
          isBuyer={true}
        />

        {/* Release Escrow Modal - Vendedor genera invoice */}
        <LightningInvoiceModal
          isOpen={showReleaseModal}
          onClose={() => setShowReleaseModal(false)}
          onSubmit={handleReleasePayment}
          title="Liberar Fondos del Escrow al Vendedor"
          description="Los fondos están actualmente retenidos en la wallet del sistema TurboZaps (en escrow). Para liberarlos, el vendedor debe generar un invoice Lightning en su wallet donde quiere recibir el pago. Una vez que ingreses el invoice, el sistema enviará los fondos desde la wallet de escrow al vendedor."
          amount={product.price}
          isRefund={false}
        />

        {/* Refund Modal - Comprador genera invoice */}
        <LightningInvoiceModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          onSubmit={handleCancelTransaction}
          title="Reembolsar al Comprador"
          description="Para devolver los fondos, el comprador debe generar un invoice Lightning donde quiere recibir el reembolso."
          amount={product.price}
          isRefund={true}
        />
      </div>
    )
  }

  // Default: pending status
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex items-center justify-center">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full max-w-md rounded-xl border border-border shadow-lg object-cover"
        />
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {product.category}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-yellow-400 mb-6">{product.price.toLocaleString()} sats</p>
          <p className="text-foreground text-lg leading-relaxed mb-8 text-muted-foreground">{product.description}</p>
          <EscrowStatusBadge status="pending" />
        </div>

        <Button
          onClick={handlePurchase}
          disabled={purchasing}
          className="w-full h-14 text-lg font-bold bg-yellow-400 hover:bg-yellow-500 text-black mt-8"
        >
          {purchasing ? (
            <>
              <Spinner className="mr-2 h-5 w-5" />
              Procesando...
            </>
          ) : (
            "Comprar con Lightning ⚡"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">Pago seguro y confirmado al instante</p>
      </div>

      {/* Payment Modal */}
      <LightningPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        invoice={invoice}
        amount={product.price}
        orderId={orderId}
        onPaymentConfirm={handlePaymentConfirm}
      />
    </div>
  )
}
