"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Send, Check, AlertCircle } from "lucide-react"

interface Message {
  id: string
  from: "buyer" | "seller"
  text: string
  timestamp: Date
}

interface EscrowChatProps {
  productName: string
  orderId?: string
  buyerPubkey?: string
  sellerPubkey?: string
  buyerName?: string
  sellerName?: string
  onRelease: () => void
  onCancel: () => void
  isBuyer: boolean
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    from: "seller",
    text: "Hola, confirma tu dirección de entrega por favor",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    from: "buyer",
    text: "Claro, en el parque central, avenida principal #123",
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "3",
    from: "seller",
    text: "Perfecto, tu pedido sale hoy. Te confirmo cuando llegue",
    timestamp: new Date(Date.now() - 600000),
  },
]

export function EscrowChat({
  productName,
  orderId,
  buyerPubkey,
  sellerPubkey,
  buyerName = "Tú",
  sellerName = "Vendedor",
  onRelease,
  onCancel,
  isBuyer,
}: EscrowChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [showConfirmRelease, setShowConfirmRelease] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages from API
  useEffect(() => {
    if (orderId) {
      const loadMessages = async () => {
        try {
          const response = await fetch(`/api/chat?order_id=${orderId}`)
          const data = await response.json()
          if (data.ok && Array.isArray(data.messages)) {
            setMessages(
              data.messages.map((msg: { id: string; from: string; text: string; timestamp: string }) => ({
                id: msg.id,
                from: msg.from as "buyer" | "seller",
                text: msg.text,
                timestamp: new Date(msg.timestamp),
              }))
            )
          }
        } catch (error) {
          console.error('Error loading messages:', error)
        }
      }
      loadMessages()

      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000)
      return () => clearInterval(interval)
    } else {
      // Fallback to initial messages if no orderId
      setMessages(INITIAL_MESSAGES)
    }
  }, [orderId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || !orderId || !buyerPubkey) return

    setLoading(true)
    const messageText = inputValue.trim()
    setInputValue("")

    try {
      // Get seller pubkey from order or use a default
      // In production, this would come from the order/product data
      const receiverPubkey = isBuyer ? sellerPubkey || "" : buyerPubkey
      const senderPubkey = isBuyer ? buyerPubkey : sellerPubkey || ""

      console.log('[EscrowChat] Sending message:', {
        isBuyer,
        senderPubkey: senderPubkey.substring(0, 20) + '...',
        receiverPubkey: receiverPubkey.substring(0, 20) + '...',
        orderId,
      })

      if (!receiverPubkey || !senderPubkey) {
        console.error('[EscrowChat] Missing pubkey information:', {
          buyerPubkey: buyerPubkey ? 'present' : 'MISSING',
          sellerPubkey: sellerPubkey ? 'present' : 'MISSING',
          isBuyer,
        })
        throw new Error(
          "Missing pubkey information. " +
          (!sellerPubkey ? "Seller pubkey not loaded. " : "") +
          (!buyerPubkey ? "Buyer pubkey not loaded. " : "") +
          "Please refresh the page or contact support."
        )
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          sender: senderPubkey,
          receiver: receiverPubkey,
          content: messageText,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        // Add message to local state immediately
        const newMessage: Message = {
          id: data.message_id || Date.now().toString(),
          from: isBuyer ? "buyer" : "seller",
          text: messageText,
          timestamp: new Date(),
        }
        setMessages([...messages, newMessage])
      } else {
        throw new Error(data.error || 'Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error instanceof Error ? error.message : "Error al enviar el mensaje")
      // Restore input value on error
      setInputValue(messageText)
    } finally {
      setLoading(false)
    }
  }

  const handleRelease = () => {
    setShowConfirmRelease(true)
  }

  const confirmRelease = () => {
    setShowConfirmRelease(false)
    onRelease()
  }

  const handleCancel = () => {
    setShowConfirmCancel(true)
  }

  const confirmCancel = () => {
    setShowConfirmCancel(false)
    onCancel()
  }

  return (
    <div className="space-y-4">
      {/* Chat Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-4 shadow-md">
        {/* Header */}
        <div className="pb-4 border-b border-border mb-4">
          <h3 className="font-bold text-foreground">{productName}</h3>
          <p className="text-sm text-muted-foreground">Comunicación segura durante la transacción</p>
        </div>

        {/* Messages */}
        <div className="space-y-3 h-80 overflow-y-auto mb-4 p-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "buyer" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  msg.from === "buyer"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 text-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.from === "buyer" ? "text-blue-100" : "text-gray-500"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="bg-background border-border"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !orderId}
            size="sm"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Escrow Status */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">🟡 Pago en escrow (asegurado)</p>
            <p>Tu dinero está seguro. Una vez que confirmes la entrega, el vendedor lo recibirá.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isBuyer ? (
          <Button
            onClick={handleRelease}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar entrega
          </Button>
        ) : (
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Cancelar transacción
          </Button>
        )}
      </div>

      {/* Confirm Release Dialog */}
      <AlertDialog open={showConfirmRelease} onOpenChange={setShowConfirmRelease}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar entrega</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmas que ya recibiste el producto en buen estado? Al hacerlo, el dinero se enviará al vendedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRelease} className="bg-green-500 hover:bg-green-600 text-white">
              Confirmar entrega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Cancel Dialog */}
      <AlertDialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar transacción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar? El dinero será devuelto al comprador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continuar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-500 hover:bg-red-600 text-white">
              Cancelar transacción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
