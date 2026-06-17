import { useQuery } from "@tanstack/react-query"

import { getOrders } from "../../api/orders"

const statusClasses = (status: string) =>
  status === "paid"
    ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
    : "bg-amber-400/15 text-amber-200 border-amber-400/30"

export default function OrdersPage() {
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  })

  if (ordersQuery.isLoading) {
    return (
      <div className="min-h-[calc(100svh-73px)] bg-slate-950 px-4 py-8 text-slate-100">
        <div className="mx-auto max-w-6xl text-slate-400">Loading orders...</div>
      </div>
    )
  }

  if (ordersQuery.isError || !ordersQuery.data) {
    return (
      <div className="min-h-[calc(100svh-73px)] bg-slate-950 px-4 py-8 text-slate-100">
        <div className="mx-auto max-w-6xl text-rose-300">
          Не удалось загрузить заказы
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100svh-73px)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
            Admin orders
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-50">
            Заказы пользователей
          </h1>
        </div>

        <div className="space-y-4">
          {ordersQuery.data.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/30 backdrop-blur"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-50">
                    Order #{order.id}
                  </div>
                  <div className="text-sm text-slate-400">User #{order.user_id}</div>
                </div>

                <div className={`inline-flex rounded-full border px-3 py-1 text-sm ${statusClasses(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="text-slate-500">Total</div>
                  <div className="mt-1 text-xl font-semibold text-emerald-300">
                    {order.total_price} ₽
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="text-slate-500">Payment</div>
                  <div className="mt-1 font-medium text-slate-100">
                    {order.payment?.status ?? "none"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="text-slate-500">Items</div>
                  <div className="mt-1 font-medium text-slate-100">
                    {order.items.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                  >
                    <div>
                      <div className="font-medium text-slate-100">
                        {item.product.name}
                      </div>
                      <div className="text-slate-500">
                        Qty {item.quantity} · {item.price} ₽
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {(item.quantity * Number(item.price)).toFixed(2)} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {ordersQuery.data.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center text-slate-400">
              Пока нет заказов.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}