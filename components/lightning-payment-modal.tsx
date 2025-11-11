"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check, Copy } from "lucide-react"

interface LightningPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: string
  amount: number
  onPaymentConfirm: () => void
}

export function LightningPaymentModal({
  open,
  onOpenChange,
  invoice,
  amount,
  onPaymentConfirm,
}: LightningPaymentModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyInvoice = async () => {
    await navigator.clipboard.writeText(invoice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Paga con Lightning ⚡</AlertDialogTitle>
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
                  Tu dinero está asegurado. Una vez que pagues, quedará guardado en un lugar seguro hasta que confirmes
                  que recibiste el producto.
                </p>
              </div>

              {/* Confirmation Button */}
              <Button
                onClick={onPaymentConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
              >
                Ya pagué ✓
              </Button>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
