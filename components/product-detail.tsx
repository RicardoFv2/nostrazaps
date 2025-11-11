"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LightningPaymentModal } from "@/components/lightning-payment-modal"
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
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>("pending")
  const [purchasing, setPurchasing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [invoice, setInvoice] = useState("")

  const generateMockInvoice = () => {
    return `lnbc${product.price}n1p3w5z8dpp5u0lyy0jz2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2dsdqqcqzpgxqrrsssp5q9l3z3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3l3lqqq0lqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      const mockInvoice = generateMockInvoice()
      setInvoice(mockInvoice)
      setShowPaymentModal(true)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setPurchasing(false)
    }
  }

  const handlePaymentConfirm = () => {
    setShowPaymentModal(false)
    setEscrowStatus("paid")
  }

  const handleReleasePayment = () => {
    setEscrowStatus("released")
  }

  const handleCancelTransaction = () => {
    setEscrowStatus("cancelled")
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
          onRelease={handleReleasePayment}
          onCancel={handleCancelTransaction}
          isBuyer={true}
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
        onPaymentConfirm={handlePaymentConfirm}
      />
    </div>
  )
}
