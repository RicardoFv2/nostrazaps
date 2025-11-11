"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EscrowsTable, type Escrow } from "@/components/escrows-table"
import { EscrowChat } from "@/components/escrow-chat"
import { Store, TrendingUp, History } from "lucide-react"

const MOCK_SELLER_ESCROWS: Escrow[] = [
  {
    id: 1,
    product: "Casco de moto",
    amount: 15000,
    status: "in_escrow",
    buyerName: "Cliente A.",
    sellerName: "Tú",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    product: "Monitor usado",
    amount: 25000,
    status: "pending_payment",
    buyerName: "Cliente B.",
    sellerName: "Tú",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    product: "Teclado mecánico",
    amount: 8000,
    status: "released",
    buyerName: "Cliente C.",
    sellerName: "Tú",
    createdAt: "2024-01-08",
  },
]

const navItems = [
  { label: "Mis ventas", href: "/dashboard/seller", icon: <Store className="w-5 h-5" /> },
  { label: "Estadísticas", href: "/dashboard/seller/stats", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Historial", href: "/dashboard/seller/history", icon: <History className="w-5 h-5" /> },
]

export default function SellerDashboard() {
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)
  const [escrows, setEscrows] = useState<Escrow[]>(MOCK_SELLER_ESCROWS)

  const handleRelease = () => {
    if (selectedEscrow) {
      setEscrows(escrows.map((e) => (e.id === selectedEscrow.id ? { ...e, status: "released" as const } : e)))
      setSelectedEscrow(null)
    }
  }

  const handleCancel = () => {
    if (selectedEscrow) {
      setEscrows(escrows.map((e) => (e.id === selectedEscrow.id ? { ...e, status: "cancelled" as const } : e)))
      setSelectedEscrow(null)
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

          <EscrowsTable escrows={escrows} role="seller" onSelectEscrow={setSelectedEscrow} />
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
            <EscrowChat
              productName={selectedEscrow.product}
              buyerName={selectedEscrow.buyerName}
              sellerName="Tú"
              onRelease={handleRelease}
              onCancel={handleCancel}
              isBuyer={false}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
