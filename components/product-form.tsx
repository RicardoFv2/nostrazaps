"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const CATEGORIES = ["Ropa", "Repuestos", "Encomiendas", "Artículos de segunda mano", "Otros"]

interface ProductFormProps {
  onProductCreated?: () => void
}

export default function ProductForm({ onProductCreated }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stalls, setStalls] = useState<Array<{ id: string; name: string }>>([])
  const [loadingStalls, setLoadingStalls] = useState(true)
  const [isMerchant, setIsMerchant] = useState(false)
  const [checkingMerchant, setCheckingMerchant] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "1",
    category: CATEGORIES[0],
    image: null as File | null,
    stall_id: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user is a merchant
  useEffect(() => {
    const checkMerchant = async () => {
      try {
        const merchantId = localStorage.getItem('merchant_id')
        if (merchantId) {
          // Verify merchant exists
          const response = await fetch('/api/merchants')
          const data = await response.json()
          if (data.ok && data.merchant) {
            setIsMerchant(true)
          } else {
            // Merchant not found, redirect to registration
            router.push('/register/merchant')
            return
          }
        } else {
          // No merchant ID, redirect to registration
          router.push('/register/merchant')
          return
        }
      } catch (error) {
        console.error('Error checking merchant:', error)
        router.push('/register/merchant')
      } finally {
        setCheckingMerchant(false)
      }
    }
    checkMerchant()
  }, [router])

  // Load stalls on mount (only if merchant)
  useEffect(() => {
    if (!isMerchant) return

    const loadStalls = async () => {
      try {
        const response = await fetch('/api/stalls')
        const data = await response.json()
        if (data.ok && Array.isArray(data.stalls)) {
          setStalls(data.stalls.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
        } else if (data.ok && data.stall) {
          // Single stall returned
          setStalls([{ id: data.stall.id, name: data.stall.name }])
        }
      } catch (error) {
        console.error('Error loading stalls:', error)
      } finally {
        setLoadingStalls(false)
      }
    }
    loadStalls()
  }, [isMerchant])

  // Clean up preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      
      // Clean up previous preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      
      setFormData((prev) => ({ ...prev, image: file }))
      
      // Create new preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert image to base64 for persistent storage
      let imageUrl: string | null = null
      if (formData.image) {
        // Convert file to base64
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result)
            } else {
              reject(new Error('Error al convertir la imagen'))
            }
          }
          reader.onerror = () => reject(new Error('Error al leer la imagen'))
          reader.readAsDataURL(formData.image!)
        })
      }

      // Get stall_id from localStorage or form
      const stallId = formData.stall_id || localStorage.getItem('stall_id')
      
      if (!stallId) {
        throw new Error('No se encontró el ID de la tienda. Por favor, crea una tienda primero.')
      }

      // Create product directly in NostrMarket via API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price_sats: parseInt(formData.price, 10),
          quantity: parseInt(formData.quantity, 10) || 1,
          category: formData.category,
          image: imageUrl,
          stall_id: stallId,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || 'Error al publicar el producto')
      }

      console.log('[ProductForm] Product created successfully:', data.product)
      
      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      
      alert("Producto publicado exitosamente!")
      
      // Reset form and file input
      setFormData({ name: "", description: "", price: "", quantity: "1", category: CATEGORIES[0], image: null, stall_id: "" })
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Callback para notificar que se creó el producto
      if (onProductCreated) {
        await onProductCreated()
      } else {
        router.push('/marketplace')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert(error instanceof Error ? error.message : "Error al publicar el producto")
    } finally {
      setLoading(false)
    }
  }

  if (checkingMerchant) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (!isMerchant) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground">
          Necesitas crear un perfil de comerciante para publicar productos.
        </p>
        <Button onClick={() => router.push('/register/merchant')} className="mt-4">
          Crear Perfil de Comerciante
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Nombre del producto</label>
        <Input name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Camiseta Azul" required />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe tu producto..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Precio (satoshis)</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="50000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Cantidad</label>
          <Input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="1"
            min="1"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Categoría</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {!loadingStalls && stalls.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Tienda (Opcional)</label>
          <select
            name="stall_id"
            value={formData.stall_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar tienda...</option>
            {stalls.map((stall) => (
              <option key={stall.id} value={stall.id}>
                {stall.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Imagen del producto</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
        />
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Vista previa"
              className="w-full h-48 object-cover rounded-md border border-border"
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" /> Publicando...
          </>
        ) : (
          "Publicar Producto"
        )}
      </Button>
    </form>
  )
}
