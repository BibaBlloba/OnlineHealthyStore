import { useCart } from "../store/cart"

export default function CartPage() {
  const items = useCart((s) => s.items)
  const remove = useCart((s) => s.remove)
  const clear = useCart((s) => s.clear)

  const total = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Cart
      </h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold">
                    {item.name}
                  </h2>

                  <p>
                    {item.price} ₽ × {item.qty}
                  </p>
                </div>

                <button
                  onClick={() => remove(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Total: {total} ₽
            </h2>

            <div className="flex gap-3">
              <button
                onClick={clear}
                className="border px-4 py-2 rounded"
              >
                Clear cart
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
