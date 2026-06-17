import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { Product } from "../types/product"
import { getProductReviews, type ProductReview } from "../api/products"
import { useAuth } from "../store/auth"
import { useCart } from "../store/cart"

type CartProduct = {
  id: number
  name: string
  price: number
}

type Review = {
  id: string
  author: string
  rating: number
  comment: string
  createdAt: string
  source: "api" | "local"
}

type Props = {
  product: Product
  onClose: () => void
  onAddToCart: (product: CartProduct) => void | Promise<void>
}

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))

const ratingLabel = (rating: number) => `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`

const mapApiReview = (review: ProductReview): Review => ({
  id: String(review.id),
  author: `Пользователь #${review.user_id}`,
  rating: review.rating,
  comment: review.comment,
  createdAt: new Date().toISOString(),
  source: "api",
})

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
}: Props) {
  const user = useAuth((state) => state.user)
  const quantity = useCart(
    (state) => state.items.find((item) => item.product_id === product.id)?.quantity ?? 0
  )
  const [localReviews, setLocalReviews] = useState<Review[]>([])
  const [text, setText] = useState("")
  const [rating, setRating] = useState("5")
  const [showAddedCheck, setShowAddedCheck] = useState(false)
  const checkTimeoutRef = useRef<number | null>(null)

  const imageUrl = product.images?.[0]?.image_url
  const imageSrc = imageUrl ? import.meta.env.VITE_API_BASE_URL + imageUrl : null
  const storageKey = useMemo(
    () => `flower-shop:product-review-drafts:${product.id}`,
    [product.id]
  )

  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", product.id],
    queryFn: () => getProductReviews(product.id),
  })

  useEffect(() => {
    try {
      const storedReviews = window.localStorage.getItem(storageKey)

      if (storedReviews) {
        const parsedReviews = JSON.parse(storedReviews) as Review[]

        if (Array.isArray(parsedReviews)) {
          setLocalReviews(parsedReviews)
          return
        }
      }
    } catch {
      setLocalReviews([])
    }

    setText("")
    setRating("5")
  }, [product.id, storageKey])

  useEffect(() => {
    if (localReviews.length === 0) {
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(localReviews))
  }, [localReviews, storageKey])

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

  const handleSubmit = () => {
    const trimmedText = text.trim()
    const author = user?.first_name?.trim() || "Гость"
    const nextRating = Number(rating)

    if (!trimmedText || Number.isNaN(nextRating)) {
      return
    }

    const nextReview: Review = {
      id: `${product.id}-${Date.now()}`,
      author,
      rating: nextRating,
      comment: trimmedText,
      createdAt: new Date().toISOString(),
      source: "local",
    }

    setLocalReviews((currentReviews) => [nextReview, ...currentReviews])
    setText("")
    setRating("5")
  }

  const apiReviews =
    reviewsQuery.data?.items.map(mapApiReview) ?? []

  const reviews = [...localReviews, ...apiReviews]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-slate-100 shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
              Карточка товара
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{product.name}</h2>
          </div>

          <button
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(92svh-88px)] overflow-y-auto px-6 py-5">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
                <div className="flex h-[360px] items-center justify-center bg-slate-950">
                  {imageSrc ? (
                    <img
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                      src={imageSrc}
                    />
                  ) : (
                    <div className="text-sm text-slate-500">Нет изображения</div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-200">
                      {product.price} ₽
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                      Остаток: {product.stock_quantity}
                    </span>
                  </div>

                  <p className="whitespace-pre-line text-left text-sm leading-6 text-slate-300">
                    {product.description || "Описание пока не добавлено."}
                  </p>

                  <div className="flex justify-end">
                    <button
                      className="group relative overflow-hidden rounded-xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400"
                      onClick={async () => {
                        await Promise.resolve(
                          onAddToCart({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                          })
                        )

                        triggerAddedAnimation()
                      }}
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
              </div>
            </div>

            <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Отзывы</h3>
                </div>

                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {reviews.length}
                </span>
              </div>

              <div className="space-y-3">
                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                >
                  <option value="5">5 - отлично</option>
                  <option value="4">4 - хорошо</option>
                  <option value="3">3 - нормально</option>
                  <option value="2">2 - слабовато</option>
                  <option value="1">1 - плохо</option>
                </select>

                <textarea
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  placeholder="Напишите отзыв о товаре"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />

                <button
                  className="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 font-medium text-emerald-200 transition hover:bg-emerald-400/25"
                  onClick={handleSubmit}
                  type="button"
                >
                  Добавить отзыв
                </button>
              </div>

              <div className="max-h-[42svh] space-y-3 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
                    {reviewsQuery.isLoading
                      ? "Загружаем отзывы..."
                      : "Пока нет отзывов. Напишите первый."}
                  </div>
                ) : (
                  reviews.map((review) => (
                    <article
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                      key={review.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-medium text-white">{review.author}</h4>
                        <span className="text-xs text-slate-500">
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-amber-300">
                        {ratingLabel(review.rating)}
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                        {review.comment}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
