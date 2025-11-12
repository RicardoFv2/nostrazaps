import { AlertCircle, CheckCircle, Circle, XCircle } from "lucide-react"

interface EscrowStatusBadgeProps {
  status: "pending" | "paid" | "released" | "cancelled"
}

export function EscrowStatusBadge({ status }: EscrowStatusBadgeProps) {
  const statusConfig = {
    pending: {
      icon: AlertCircle,
      label: "Esperando pago",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      dot: "🟡",
    },
    paid: {
      icon: Circle,
      label: "💰 Fondos retenidos en escrow",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      dot: "🔒",
    },
    released: {
      icon: CheckCircle,
      label: "Liberado al vendedor",
      color: "bg-green-100 text-green-800 border-green-300",
      dot: "🟢",
    },
    cancelled: {
      icon: XCircle,
      label: "Cancelado",
      color: "bg-red-100 text-red-800 border-red-300",
      dot: "🔴",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${config.color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {config.dot} {config.label}
      </span>
    </div>
  )
}
