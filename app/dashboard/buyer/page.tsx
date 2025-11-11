"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EscrowsTable, type Escrow } from "@/components/escrows-table"
import { EscrowChat } from "@/components/escrow-chat"
import { ShoppingCart, History } from "lucide-react"

const MOCK_BUYER_ESCROWS: Escrow[] = [
  {
    id: 1,
    product: "Casco de moto",
    amount: 15000,
    status: "in_escrow",
    buyerName: "Tú",
    sellerName: "Carlos M.",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    product: "Teléfono usado",
    amount: 30000,
    status: "pending_payment",
    buyerName: "Tú",
    sellerName: "María L.",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    product: "Repuestos para auto",
    amount: 5000,
    status: "released",
    buyerName: "Tú",
    sellerName: "Juan D.",
    createdAt: "2024-01-10",
  },
]

const navItems = [
  { label: "Mis compras", href: "/dashboard/buyer", icon: <ShoppingCart className="w-5 h-5" /> },
  { label: "Historial", href: "/dashboard/buyer/history", icon: <History className="w-5 h-5" /> },
]

export default function BuyerDashboard() {
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)
  const [escrows, setEscrows] = useState<Escrow[]>(MOCK_BUYER_ESCROWS)

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
    <DashboardLayout role="buyer" navItems={navItems}>
      {!selectedEscrow ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mis Compras</h1>
            <p className="text-muted-foreground">Gestiona tus transacciones y escrows activos</p>
          </div>
          <EscrowsTable escrows={escrows} role="buyer" onSelectEscrow={setSelectedEscrow} />
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
            <EscrowChat
              productName={selectedEscrow.product}
              buyerName="Tú"
              sellerName={selectedEscrow.sellerName}
              onRelease={handleRelease}
              onCancel={handleCancel}
              isBuyer={true}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
