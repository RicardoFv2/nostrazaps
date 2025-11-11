"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const CATEGORIES = ["Ropa", "Repuestos", "Encomiendas", "Artículos de segunda mano", "Otros"]

export default function ProductForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: CATEGORIES[0],
    image: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Producto publicado exitosamente!")
      setFormData({ name: "", description: "", price: "", category: CATEGORIES[0], image: null })
    } catch (error) {
      alert("Error al publicar el producto")
    } finally {
      setLoading(false)
    }
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
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Imagen del producto</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
        />
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
