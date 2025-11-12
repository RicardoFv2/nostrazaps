"use client"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export interface Escrow {
  id: number
  product: string
  amount: number
  status: "pending_payment" | "in_escrow" | "released" | "cancelled"
  buyerName: string
  sellerName: string
  createdAt: string
  orderId?: string
  buyerPubkey?: string
}

interface EscrowsTableProps {
  escrows: Escrow[]
  role: "buyer" | "seller"
  onSelectEscrow: (escrow: Escrow) => void
}

const STATUS_COLORS = {
  pending_payment: { badge: "🟡", label: "En espera de pago", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  in_escrow: { badge: "🟢", label: "En escrow", bg: "bg-green-50 dark:bg-green-900/20" },
  released: { badge: "🔵", label: "Liberado", bg: "bg-blue-50 dark:bg-blue-900/20" },
  cancelled: { badge: "🔴", label: "Cancelado", bg: "bg-red-50 dark:bg-red-900/20" },
}

export function EscrowsTable({ escrows, role, onSelectEscrow }: EscrowsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold text-foreground">Producto</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                {role === "buyer" ? "Vendedor" : "Comprador"}
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Monto (sats)</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Estado</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {escrows.map((escrow) => {
              const statusInfo = STATUS_COLORS[escrow.status]
              return (
                <tr key={escrow.id} className={`hover:bg-muted/50 transition-colors cursor-pointer ${statusInfo.bg}`}>
                  <td className="px-6 py-4 font-medium text-foreground">{escrow.product}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {role === "buyer" ? escrow.sellerName : escrow.buyerName}
                  </td>
                  <td className="px-6 py-4 font-mono text-foreground">{escrow.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-background">
                      {statusInfo.badge} {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => onSelectEscrow(escrow)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {escrows.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <p>No hay transacciones aún</p>
        </div>
      )}
    </div>
  )
}
