type Product = {
  id: number
  name: string
  price: number
}

type Props = {
  product: Product
  onAdd: (product: Product) => void
}

export default function ProductCard({ product, onAdd }: Props) {
  return (
    <div className="border p-4 rounded-xl">
      <h2>{product.name}</h2>
      <p>{product.price} ₽</p>

      <button
        className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
        onClick={() => onAdd(product)}
      >
        В корзину
      </button>
    </div>
  )
}
