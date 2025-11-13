"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Check, Copy } from "lucide-react"
import { isValidLightningInvoice, getLightningInvoiceNetwork } from "@/lib/utils"

interface LightningInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (invoice: string) => void
  title: string
  description: string
  amount: number
  isRefund?: boolean
}

export function LightningInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  amount,
  isRefund = false,
}: LightningInvoiceModalProps) {
  const [invoice, setInvoice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!invoice.trim()) {
      setError("Por favor ingresa un invoice Lightning válido")
      return
    }

    // Validate Lightning invoice format (supports mainnet, testnet, regtest, signet)
    if (!isValidLightningInvoice(invoice)) {
      setError("Invoice inválido. Debe comenzar con 'lnbc' (mainnet), 'lntb' (testnet), 'lnbcrt' (regtest) o 'lnbcs' (signet)")
      return
    }
    
    // Optional: Log network type for debugging
    const network = getLightningInvoiceNetwork(invoice)
    if (network) {
      console.log(`[LightningInvoiceModal] Invoice network detected: ${network}`)
    }

    setLoading(true)
    setError("")

    try {
      await onSubmit(invoice.trim())
      // Reset form on success
      setInvoice("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el invoice")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInvoice("")
    setError("")
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isRefund ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* Amount Display */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              Monto: <span className="text-lg">{amount.toLocaleString()} sats</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📱 Instrucciones:
            </p>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Abre tu wallet Lightning (Phoenix, Wallet of Satoshi, etc.)</li>
              <li>Genera un invoice (factura) por <strong>{amount.toLocaleString()} sats</strong></li>
              <li>Copia el invoice (comienza con "lnbc", "lntb", "lnbcrt" o "lnbcs")</li>
              <li>Pégalo abajo y confirma</li>
            </ol>
          </div>

          {/* Invoice Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Lightning Invoice (bolt11):
            </label>
            <div className="relative">
              <Input
                value={invoice}
                onChange={(e) => {
                  setInvoice(e.target.value)
                  setError("")
                }}
                placeholder="lnbc... o lntb... (mainnet/testnet/regtest)"
                className="pr-10 font-mono text-sm bg-background border-border"
              />
              {invoice && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => {
                    navigator.clipboard.readText().then((text) => {
                      if (text) {
                        setInvoice(text)
                      }
                    })
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Security Note */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              🔒 <strong>Seguridad:</strong> El invoice debe ser por exactamente <strong>{amount.toLocaleString()} sats</strong>.
              El sistema verificará el monto antes de enviar el pago.
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={!invoice.trim() || loading}
            className={
              isRefund
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Procesando...
              </>
            ) : isRefund ? (
              "Procesar Reembolso"
            ) : (
              "Liberar Fondos"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

