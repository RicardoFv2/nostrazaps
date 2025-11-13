import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    category: string
    quantity?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
      <div className="w-full h-64 overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-black bg-yellow-400 px-2 py-1 rounded-full inline-block mb-2">
            {product.category}
          </div>

          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-yellow-400">{product.price.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">sats</span>
          </div>

          {product.quantity !== undefined && (
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">Cantidad disponible: </span>
              <span className={product.quantity > 0 ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                {product.quantity}
              </span>
            </div>
          )}
        </div>

        <Button className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold transition-colors">
          Ver producto
        </Button>
      </div>
    </div>
  )
}
