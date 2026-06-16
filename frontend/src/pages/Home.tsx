import { useState } from "react"
import { useProducts } from "../hooks/useProducts"
import { useCart } from "../store/cart"

export default function Home() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useProducts(page)
  const add = useCart((s) => s.add)

  if (isLoading) return <div>Loading...</div>

  const totalPages = Math.ceil(data.total / data.per_page)

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4">
        {data.items.map((p: any) => (
          <div key={p.id} className="border p-4 rounded-xl">
            <h2>{p.name}</h2>
            <p>{p.price} ₽</p>

            <button
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
              onClick={() => add(p)}
            >
              В корзину
            </button>
          </div>
        ))}
      </div>

      {/* пагинация */}
      <div className="flex gap-2 mt-6 items-center">
        <button
          className="px-3 py-1 border"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ←
        </button>

        <span>
          Страница: {page} / {totalPages}
        </span>

        <button
          className="px-3 py-1 border"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          →
        </button>
      </div>
    </div>
  )
}
