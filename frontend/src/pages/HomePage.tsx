import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useProducts } from "../hooks/useProducts"
import { useCart } from "../store/cart"
import ProductCard from "../components/ProductCard"
import ProductDetailsModal from "../components/ProductDetailsModal.tsx"
import ProductFilters from "../components/admin/ProductFilters"
import { getCategories } from "../api/categories"
import type { Product } from "../types/product"

export default function Home() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data, isLoading, isError } = useProducts(page, filters, 9)
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })
  const addProduct = useCart((s) => s.addProduct)

  if (isLoading || categoriesQuery.isLoading) return <div>Loading...</div>
  if (isError || !data) return <div>Не удалось загрузить товары</div>
  if (categoriesQuery.isError || !categoriesQuery.data) {
    return <div>Не удалось загрузить категории</div>
  }

  const totalPages = Math.ceil(data.total / data.per_page)

  const handleFiltersChange = (nextFilters: any) => {
    setPage(1)
    setFilters(nextFilters)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <ProductFilters
          categories={categoriesQuery.data ?? []}
          onChange={handleFiltersChange}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {data.items.map((p: Product) => (
          <ProductCard
            key={p.id}
            product={p}
            onOpen={() => setSelectedProduct(p)}
            onAdd={(product: { id: number }) => void addProduct(product.id)}
          />
        ))}
      </div>

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

      {selectedProduct && (
        <ProductDetailsModal
          key={selectedProduct.id}
          onAddToCart={(product: { id: number }) => void addProduct(product.id)}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </div>
  )
}
