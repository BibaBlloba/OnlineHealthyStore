import type { Product as ApiProduct } from "../types/product"

type Product = Pick<ApiProduct, "id" | "name" | "price" | "images">

type CartProduct = {
  id: number
  name: string
  price: number
}

type Props = {
  product: Product
  onAdd: (product: CartProduct) => void
}

export default function ProductCard({ product, onAdd }: Props) {
  const imageUrl = product.images?.[0]?.image_url
  const imageSrc = imageUrl ? import.meta.env.VITE_API_BASE_URL + imageUrl : null

  return (
    <div className="flex h-[390px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:shadow-black/50">
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
          className="mt-auto rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          onClick={() =>
            onAdd({
              id: product.id,
              name: product.name,
              price: Number(product.price),
            })
          }
        >
          В корзину
        </button>
      </div>
    </div>
  )
}
