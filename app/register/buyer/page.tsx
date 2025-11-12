"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export default function RegisterBuyerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [merchants, setMerchants] = useState<Array<{ id: string; name: string }>>([])
  const [loadingMerchants, setLoadingMerchants] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    public_key: "",
    merchant_id: "",
  })

  // Load merchants on mount
  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const response = await fetch('/api/merchants')
        const data = await response.json()
        if (data.ok && data.merchant) {
          // If there's a merchant, use it
          setMerchants([{ id: data.merchant.id || '', name: data.merchant.config?.name || 'Merchant' }])
          setFormData(prev => ({ ...prev, merchant_id: data.merchant.id || '' }))
        }
      } catch (error) {
        console.error('Error loading merchants:', error)
      } finally {
        setLoadingMerchants(false)
      }
    }
    loadMerchants()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generatePublicKey = () => {
    // Generate valid Nostr public key in hexadecimal format (64 chars)
    // LNbits NostrMarket expects hex format, not bech32 (npub)
    
    // Generate 32 random bytes = 64 hex characters
    const generateHexKey = () => {
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }
    
    const publicKey = generateHexKey()
    setFormData((prev) => ({ ...prev, public_key: publicKey }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.public_key || !formData.merchant_id) {
        alert("Por favor completa todos los campos requeridos")
        setLoading(false)
        return
      }

      // Create customer via API
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: formData.merchant_id,
          public_key: formData.public_key,
          profile: {
            name: formData.name,
          },
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || 'Error al crear el perfil de comprador')
      }

      // Store buyer info in localStorage
      localStorage.setItem('buyer_pubkey', formData.public_key)
      localStorage.setItem('buyer_name', formData.name)
      localStorage.setItem('customer_id', data.customer.id || '')

      alert("Perfil de comprador creado exitosamente!")
      router.push('/marketplace')
    } catch (error) {
      console.error('Error creating customer:', error)
      alert(error instanceof Error ? error.message : "Error al crear el perfil de comprador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/select-role" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Volver
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Crear Perfil de Comprador</h1>
          <p className="text-muted-foreground">
            Crea tu perfil para comenzar a comprar productos en TurboZaps
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          {!loadingMerchants && merchants.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Comerciante <span className="text-red-500">*</span>
              </label>
              <select
                name="merchant_id"
                value={formData.merchant_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Seleccionar comerciante...</option>
                {merchants.map((merchant) => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground">
                Clave Pública Nostr (hex) <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                onClick={generatePublicKey}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Generar clave
              </Button>
            </div>
            
            <Input
              name="public_key"
              value={formData.public_key}
              onChange={handleChange}
              placeholder="64 caracteres hexadecimales..."
              required
              className="font-mono text-xs"
            />

            <p className="text-xs text-muted-foreground">
              💡 Tu clave pública Nostr se usa para autenticación y comunicación con vendedores. 
              Se genera en formato hexadecimal (64 caracteres).
            </p>
          </div>

          <Button type="submit" disabled={loading || loadingMerchants} className="w-full h-12">
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Creando perfil...
              </>
            ) : (
              "Crear Perfil de Comprador"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}

