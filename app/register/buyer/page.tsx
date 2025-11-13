"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { generateSecretKey, getPublicKey } from "nostr-tools"
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
          const merchantId = data.merchant.id || data.merchant.merchant_id || ''
          const merchantName = data.merchant.config?.name || 'Merchant'
          
          if (merchantId) {
            setMerchants([{ id: merchantId, name: merchantName }])
            setFormData(prev => ({ ...prev, merchant_id: merchantId }))
          } else {
            console.warn('Merchant loaded but no valid ID found')
          }
        } else {
          console.warn('No merchant found. Please create a merchant first.')
        }
      } catch (error) {
        console.error('Error loading merchants:', error)
        // Don't show alert here, just log the error
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
    // Generate valid Nostr keys using nostr-tools
    // This generates a real private key and derives the corresponding public key
    // For buyers, we only need the public key, but it must be derived from a valid private key
    // Both keys are in hexadecimal format (64 characters) as expected by LNbits NostrMarket
    
    try {
      // Generate a valid Nostr secret key (returns Uint8Array of 32 bytes)
      const secretKey = generateSecretKey()
      
      // Derive the public key from the secret key (returns hex string, 64 characters)
      const publicKey = getPublicKey(secretKey)
      
      // Optionally convert secret key to hex for storage (if buyer needs to sign events later)
      // const privateKey = Array.from(secretKey, byte => 
      //   byte.toString(16).padStart(2, '0')
      // ).join('')
      
      setFormData((prev) => ({
        ...prev,
        public_key: publicKey,
      }))
    } catch (error) {
      console.error('Error generating Nostr public key:', error)
      alert('Error al generar la clave pública Nostr. Por favor intenta nuevamente.')
    }
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

      // Validate public key format (should be 64 hex characters)
      const hexRegex = /^[0-9a-f]{64}$/i
      if (!hexRegex.test(formData.public_key)) {
        alert("La clave pública debe tener 64 caracteres hexadecimales. Por favor genera una nueva clave.")
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

          {!loadingMerchants && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Comerciante <span className="text-red-500">*</span>
              </label>
              {merchants.length > 0 ? (
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
              ) : (
                <div className="p-4 border border-yellow-500 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ No hay comerciantes disponibles. Por favor crea un perfil de comerciante primero.
                  </p>
                  <Link 
                    href="/register/merchant" 
                    className="text-sm text-yellow-600 dark:text-yellow-400 underline mt-2 inline-block"
                  >
                    Crear perfil de comerciante →
                  </Link>
                </div>
              )}
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

