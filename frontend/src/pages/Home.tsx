import { useProducts } from "../hooks/useProducts"
import { useCart } from "../store/cart"

export default function Home() {
  const { data, isLoading } = useProducts()
  const add = useCart((s) => s.add)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {data.map((p: any) => (
        <div key={p.id} className="border p-4 rounded-xl">
          <h2 className="font-bold">{p.name}</h2>
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
  )
}
