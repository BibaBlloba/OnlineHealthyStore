import { useEffect, useRef, useState } from "react"
import type { Product as ApiProduct } from "../types/product"
import { useCart } from "../store/cart"

type Product = Pick<ApiProduct, "id" | "name" | "price" | "images">

type CartProduct = {
  id: number
  name: string
  price: number
}

type Props = {
  product: Product
  onAdd: (product: CartProduct) => void | Promise<void>
  onOpen: (product: Product) => void
}

export default function ProductCard({ product, onAdd, onOpen }: Props) {
  const quantity = useCart(
    (state) => state.items.find((item) => item.product_id === product.id)?.quantity ?? 0
  )
  const [showAddedCheck, setShowAddedCheck] = useState(false)
  const checkTimeoutRef = useRef<number | null>(null)
  const imageUrl = product.images?.[0]?.image_url
  const imageSrc = imageUrl ? import.meta.env.VITE_API_BASE_URL + imageUrl : null

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current !== null) {
        window.clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [])

  const triggerAddedAnimation = () => {
    if (checkTimeoutRef.current !== null) {
      window.clearTimeout(checkTimeoutRef.current)
    }

    setShowAddedCheck(true)
    checkTimeoutRef.current = window.setTimeout(() => {
      setShowAddedCheck(false)
      checkTimeoutRef.current = null
    }, 900)
  }

  const handleAddToCart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    await Promise.resolve(
      onAdd({
        id: product.id,
        name: product.name,
        price: Number(product.price),
      })
    )

    triggerAddedAnimation()
  }

  return (
    <div
      className="flex h-[390px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:shadow-black/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
      onClick={() => onOpen(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen(product)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="h-48 w-full bg-slate-950">
        {imageSrc ? (
          <img
            alt={product.name}
            className="h-full w-full object-contain p-2"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="min-h-14 text-lg font-semibold text-slate-100">
          {product.name}
        </h2>

        <p className="mt-2 text-slate-300">{product.price} ₽</p>

        <button
          className="group relative mt-auto overflow-hidden rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          onClick={handleAddToCart}
          type="button"
        >
          <span className="flex items-center justify-between gap-3">
            <span>В корзину</span>
            {quantity > 0 && (
              <span className="min-w-7 rounded-full bg-slate-950/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-950">
                {quantity}
              </span>
            )}
          </span>

          <span
            className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white px-1.5 py-1 text-emerald-500 shadow-lg shadow-black/20 transition-all duration-300 ${showAddedCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
            aria-hidden="true"
          >
            ✓
          </span>
        </button>
      </div>
    </div>
  )
}
