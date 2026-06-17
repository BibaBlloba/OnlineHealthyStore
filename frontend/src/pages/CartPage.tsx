import { useEffect, useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { createOrder, getOrder, payOrder } from "../api/orders"
import { useCart } from "../store/cart"
import type { Order } from "../types/order"

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const response = error as { response?: { data?: { detail?: string } } }

    if (response.response?.data?.detail) {
      return response.response.data.detail
    }
  }

  return error instanceof Error ? error.message : "Не удалось выполнить действие"
}

export default function CartPage() {
  const cart = useCart((s) => s.cart)
  const items = useCart((s) => s.items)
  const isLoading = useCart((s) => s.isLoading)
  const error = useCart((s) => s.error)
  const loadCart = useCart((s) => s.loadCart)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const removeItem = useCart((s) => s.removeItem)
  const clearCart = useCart((s) => s.clearCart)

  const [paymentMethod, setPaymentMethod] = useState("card")
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    void loadCart()
  }, [loadCart])

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      ),
    [items]
  )

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setCurrentOrder(order)
      setActionError(null)
      void loadCart()
    },
    onError: (mutationError) => {
      setActionError(getErrorMessage(mutationError))
    },
  })

  const payOrderMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: number }) =>
      payOrder(orderId, { payment_method: paymentMethod }),
    onSuccess: async (_, variables) => {
      const freshOrder = await getOrder(variables.orderId)

      setCurrentOrder(freshOrder)
      setActionError(null)
      void loadCart()
    },
    onError: (mutationError) => {
      setActionError(getErrorMessage(mutationError))
    },
  })

  const handleCreateOrder = () => {
    setActionError(null)
    createOrderMutation.mutate()
  }

  const handlePayOrder = () => {
    if (!currentOrder) {
      return
    }

    setActionError(null)
    payOrderMutation.mutate({ orderId: currentOrder.id })
  }

  const handleClearCart = async () => {
    setActionError(null)
    await clearCart()
    setCurrentOrder(null)
  }

  const isBusy =
    isLoading || createOrderMutation.isPending || payOrderMutation.isPending

  return (
    <div className="min-h-[calc(100svh-73px)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(180deg,#020617_0%,#020617_45%,#0f172a_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
                Cart & checkout
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-50 md:text-4xl">
                Корзина
              </h1>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <div className="text-sm text-slate-400">Общая сумма</div>
              <div className="text-2xl font-semibold text-emerald-300">
                {total.toFixed(2)} ₽
              </div>
            </div>
          </div>

          {(error || actionError) && (
            <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {actionError ?? error}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/30 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">
                  Товары в корзине
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {cart?.id ? `корзина #${cart.id}` : "Корзина еще не загружена"}
                </p>
              </div>

              {items.length > 0 && (
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-rose-400/40 hover:bg-rose-400/10"
                  disabled={isBusy}
                  onClick={() => void handleClearCart()}
                >
                  Очистить корзину
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-slate-400">
                Корзина пуста. Добавьте товары с главной страницы.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const imageUrl = item.product.images?.[0]?.image_url
                  const imageSrc = imageUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`
                    : null

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                        {imageSrc ? (
                          <img
                            alt={item.product.name}
                            className="h-full w-full object-contain p-2"
                            src={imageSrc}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-slate-100">
                              {item.product.name}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                              {item.product.description}
                            </p>
                          </div>

                          <div className="text-right text-sm text-slate-300">
                            <div>{Number(item.product.price).toFixed(2)} ₽</div>
                            <div className="text-slate-500">за штуку</div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center rounded-full border border-white/10 bg-slate-950/60">
                            <button
                              className="px-3 py-2 text-slate-200 transition hover:text-emerald-300 disabled:opacity-50"
                              disabled={isBusy || item.quantity <= 1}
                              onClick={() =>
                                void updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              −
                            </button>

                            <span className="min-w-12 px-3 text-center text-sm font-medium text-slate-100">
                              {item.quantity}
                            </span>

                            <button
                              className="px-3 py-2 text-slate-200 transition hover:text-emerald-300 disabled:opacity-50"
                              disabled={isBusy}
                              onClick={() =>
                                void updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <div className="text-sm text-slate-300">
                            Сумма: {(Number(item.product.price) * item.quantity).toFixed(2)} ₽
                          </div>

                          <button
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-rose-400/40 hover:bg-rose-400/10"
                            disabled={isBusy}
                            onClick={() => void removeItem(item.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/30 backdrop-blur">
              <h2 className="text-2xl font-semibold text-slate-50">Оформление</h2>

              <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Товаров</span>
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Сумма</span>
                  <span>{total.toFixed(2)} ₽</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Статус заказа</span>
                  <span>{currentOrder?.status ?? "не создан"}</span>
                </div>
              </div>

              <button
                className="mt-4 w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={items.length === 0 || isBusy}
                onClick={handleCreateOrder}
              >
                Создать заказ
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/30 backdrop-blur">
              <h2 className="text-2xl font-semibold text-slate-50">Оплата</h2>

              {currentOrder ? (
                <>
                  <label className="mt-4 block text-sm text-slate-300">
                    Способ оплаты
                    <input
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      value={paymentMethod}
                    />
                  </label>

                  <button
                    className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentOrder.status === "paid" || isBusy}
                    onClick={handlePayOrder}
                  >
                    {currentOrder.status === "paid"
                      ? "Заказ уже оплачен"
                      : "Оплатить заказ"}
                  </button>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Order ID</span>
                      <span>#{currentOrder.id}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Итог</span>
                      <span>{currentOrder.total_price} ₽</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Оплата</span>
                      <span>{currentOrder.payment?.status ?? "pending"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
                  Сначала создайте заказ из текущей корзины.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
