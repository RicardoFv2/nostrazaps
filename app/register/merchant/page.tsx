"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export default function RegisterMerchantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    private_key: "",
    public_key: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateNostrKeys = () => {
    // Generate valid Nostr keys in hexadecimal format (64 chars each)
    // LNbits NostrMarket expects hex format, not bech32 (nsec/npub)
    
    // Generate 32 random bytes = 64 hex characters
    const generateHexKey = () => {
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }
    
    const privateKey = generateHexKey()
    const publicKey = generateHexKey()
    
    setFormData((prev) => ({
      ...prev,
      private_key: privateKey,
      public_key: publicKey,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.private_key || !formData.public_key) {
        alert("Por favor completa todos los campos requeridos")
        setLoading(false)
        return
      }

      // Create merchant via API
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          private_key: formData.private_key,
          public_key: formData.public_key,
          config: {
            name: formData.name,
            about: formData.about || undefined,
            active: true,
          },
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || 'Error al crear el perfil de comerciante')
      }

      // Store merchant info in localStorage (iniciar sesión con npub)
      const merchantId = data.merchant.id || data.merchant.merchant_id || ''
      localStorage.setItem('merchant_id', merchantId)
      localStorage.setItem('merchant_name', formData.name)
      localStorage.setItem('merchant_private_key', formData.private_key)
      localStorage.setItem('merchant_public_key', formData.public_key)
      localStorage.setItem('merchant_npub', formData.public_key) // Usar npub para sesión
      localStorage.setItem('is_merchant_logged_in', 'true')

      // Create a default stall for the merchant
      let stallId = ''
      try {
        // Get wallet ID from environment or use merchant ID as wallet
        // In production, you'd get this from LNbits wallet creation
        const walletId = merchantId // Using merchant ID as wallet ID for now
        
        const stallResponse = await fetch('/api/stalls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: walletId,
            name: `${formData.name} - Tienda`,
            currency: 'sat',
            shipping_zones: [],
          }),
        })

        const stallData = await stallResponse.json()
        if (stallData.ok && stallData.stall) {
          stallId = stallData.stall.id || ''
          localStorage.setItem('stall_id', stallId)
        }
      } catch (stallError) {
        console.error('Error creating stall (non-fatal):', stallError)
        // Continue even if stall creation fails
      }

      // Redirigir a la página de productos del merchant
      router.push('/sell')
    } catch (error) {
      console.error('Error creating merchant:', error)
      alert(error instanceof Error ? error.message : "Error al crear el perfil de comerciante")
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Crear Perfil de Comerciante</h1>
          <p className="text-muted-foreground">
            Crea tu perfil para comenzar a vender productos en TurboZaps
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Nombre del negocio <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Mi Tienda TurboZaps"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Descripción (Opcional)</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Describe tu negocio..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground">
                Claves Nostr <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                onClick={generateNostrKeys}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Generar claves
              </Button>
            </div>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Clave Privada (hex)</label>
              <Input
                name="private_key"
                value={formData.private_key}
                onChange={handleChange}
                placeholder="64 caracteres hexadecimales..."
                required
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Clave Pública (hex)</label>
              <Input
                name="public_key"
                value={formData.public_key}
                onChange={handleChange}
                placeholder="64 caracteres hexadecimales..."
                required
                className="font-mono text-xs"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              💡 Las claves Nostr se usan para autenticación y comunicación P2P. 
              Guarda tu clave privada de forma segura. Se generan en formato hexadecimal (64 caracteres).
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Creando perfil...
              </>
            ) : (
              "Crear Perfil de Comerciante"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}

