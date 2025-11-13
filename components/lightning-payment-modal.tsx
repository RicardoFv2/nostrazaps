"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check, Copy, Loader2 } from "lucide-react"

interface LightningPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: string
  amount: number
  orderId: string | null
  onPaymentConfirm: () => void
}

export function LightningPaymentModal({
  open,
  onOpenChange,
  invoice,
  amount,
  orderId,
  onPaymentConfirm,
}: LightningPaymentModalProps) {
  const [copied, setCopied] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasDetectedPaymentRef = useRef(false)

  const handleCopyInvoice = async () => {
    await navigator.clipboard.writeText(invoice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check payment status directly in LNbits using payment_hash
  const checkPaymentStatus = async (): Promise<boolean> => {
    if (!orderId) return false

    try {
      // First, get the order to obtain payment_hash
      const orderResponse = await fetch(`/api/orders/${orderId}`)
      const orderData = await orderResponse.json()

      if (!orderData.ok || !orderData.order) {
        return false
      }

      const order = orderData.order
      const paymentHash = order.payment_hash

      // If no payment_hash, fallback to checking order status
      if (!paymentHash) {
        console.log('[checkPaymentStatus] No payment_hash found, checking order status')
        return order.status === 'paid' || order.status === 'released'
      }

      // Check payment status directly in LNbits
      console.log('[checkPaymentStatus] Checking payment status for hash:', paymentHash.substring(0, 16) + '...')
      const paymentResponse = await fetch(`/api/payments/check?payment_hash=${encodeURIComponent(paymentHash)}`)
      const paymentData = await paymentResponse.json()

      console.log('[checkPaymentStatus] Payment check response:', {
        ok: paymentData.ok,
        paid: paymentData.paid,
        hasDetails: !!paymentData.details,
      })

      if (paymentData.ok && paymentData.paid) {
        console.log('[checkPaymentStatus] ✅ Payment confirmed as paid in LNbits')
        
        // Update order status if payment is confirmed but order status is still pending
        if (order.status === 'pending') {
          console.log('[checkPaymentStatus] Updating order status to paid...')
          try {
            const updateResponse = await fetch(`/api/orders/${orderId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paid: true,
              }),
            })
            const updateData = await updateResponse.json()
            console.log('[checkPaymentStatus] Order status update result:', updateData.ok)
          } catch (updateError) {
            console.error('[checkPaymentStatus] Error updating order status:', updateError)
          }
        }
        
        return true
      }

      console.log('[checkPaymentStatus] Payment not yet confirmed as paid')
      return false
    } catch (error) {
      console.error('Error checking payment status:', error)
      return false
    }
  }

  // Start polling for payment status when modal opens
  useEffect(() => {
    if (open && orderId && !hasDetectedPaymentRef.current) {
      setIsCheckingPayment(true)
      
      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(async () => {
        const isPaid = await checkPaymentStatus()
        
        if (isPaid && !hasDetectedPaymentRef.current) {
          hasDetectedPaymentRef.current = true
          setIsCheckingPayment(false)
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          
          // Automatically confirm payment
          onPaymentConfirm()
        }
      }, 2000) // Check every 2 seconds
    }

    // Cleanup: stop polling when modal closes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      hasDetectedPaymentRef.current = false
      setIsCheckingPayment(false)
    }
  }, [open, orderId, onPaymentConfirm])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Paga con Lightning en TurboZaps ⚡</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-center">
              {/* Amount */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                <p className="text-sm text-blue-100 mb-1">Monto a pagar</p>
                <p className="text-3xl font-bold">{amount.toLocaleString()} sats</p>
              </div>

              {/* QR Code */}
              <div>
                <p className="text-foreground font-semibold mb-3">Escanea con tu billetera Lightning</p>
                <div className="flex justify-center p-4 bg-white rounded-lg border border-border">
                  <QRCodeSVG value={invoice} size={200} level="H" includeMargin={true} />
                </div>
              </div>

              {/* Invoice Text */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">O copia este código de pago:</p>
                <div className="bg-muted rounded-lg p-3 break-all">
                  <code className="text-xs font-mono text-foreground">{invoice.slice(0, 50)}...</code>
                </div>
                <Button
                  onClick={handleCopyInvoice}
                  size="sm"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Invoice
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  Tu dinero está asegurado con TurboZaps. Una vez que pagues, quedará guardado en un lugar seguro hasta que confirmes
                  que recibiste el producto.
                </p>
              </div>

              {/* Payment Status Indicator */}
              {isCheckingPayment && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando pago automáticamente...</span>
                </div>
              )}

              {/* Confirmation Button */}
              <Button
                onClick={onPaymentConfirm}
                disabled={isCheckingPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Ya pagué ✓'
                )}
              </Button>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
