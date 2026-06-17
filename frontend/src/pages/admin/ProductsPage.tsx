import { useEffect, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import ProductFilters from "../../components/admin/ProductFilters"

import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProduct,
  getProducts,
  updateProduct,
  uploadProductImage,
} from "../../api/products"
import { getCategories } from "../../api/categories"

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
}

export default function ProductsPage() {
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const productsQuery = useQuery({
    queryKey: ["products", filters, page],
    queryFn: () =>
      getProducts({
        ...filters,
        page,
        per_page: 15,
      }),
  })

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const selectedProductQuery = useQuery({
    queryKey: ["product", selectedProductId],
    queryFn: () => getProduct(selectedProductId as number),
    enabled: modalMode === "edit" && selectedProductId !== null,
  })

  useEffect(() => {
    if (modalMode === "create") {
      setForm(EMPTY_FORM)
      return
    }

    if (modalMode === "edit" && selectedProductQuery.data) {
      setForm({
        name: selectedProductQuery.data.name ?? "",
        description: selectedProductQuery.data.description ?? "",
        price: String(selectedProductQuery.data.price ?? ""),
        stock_quantity: String(selectedProductQuery.data.stock_quantity ?? ""),
        category_id: String(selectedProductQuery.data.category_id ?? ""),
      })
    }
  }, [modalMode, selectedProductQuery.data])

  const createMutation = useMutation({
    mutationFn: async () => {
      const createdProduct = await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        category_id: Number(form.category_id),
      })

      if (imageFile) {
        await uploadProductImage(createdProduct.id, imageFile)
      }

      return createdProduct
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      setModalMode(null)
      setSelectedProductId(null)
      setForm(EMPTY_FORM)
      setImageFile(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (selectedProductId === null) {
        throw new Error("No product selected")
      }

      const updatedProduct = await updateProduct(selectedProductId, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
      })

      if (imageFile) {
        await uploadProductImage(selectedProductId, imageFile)
      }

      return updatedProduct
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      if (selectedProductId !== null) {
        await queryClient.invalidateQueries({ queryKey: ["product", selectedProductId] })
      }
      setModalMode(null)
      setSelectedProductId(null)
      setForm(EMPTY_FORM)
      setImageFile(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      if (modalMode === "edit" && selectedProductId !== null) {
        setModalMode(null)
        setSelectedProductId(null)
        setForm(EMPTY_FORM)
        setImageFile(null)
      }
    },
  })

  const removeImageMutation = useMutation({
    mutationFn: async () => {
      if (selectedProductId === null) {
        throw new Error("No product selected")
      }

      return deleteProductImage(selectedProductId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      if (selectedProductId !== null) {
        await queryClient.invalidateQueries({ queryKey: ["product", selectedProductId] })
      }
    },
  })

  const handleOpenCreate = () => {
    setImageFile(null)
    setForm(EMPTY_FORM)
    setSelectedProductId(null)
    setModalMode("create")
  }

  const handleOpenEdit = (productId: number) => {
    setImageFile(null)
    setForm(EMPTY_FORM)
    setSelectedProductId(productId)
    setModalMode("edit")
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setSelectedProductId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
  }

  const handleFiltersChange = (nextFilters: any) => {
    setPage(1)
    setFilters(nextFilters)
  }

  const handlePrevPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1))
  }

  const handleNextPage = () => {
    setPage((currentPage) => Math.min(totalPages, currentPage + 1))
  }

  if (
    productsQuery.isLoading ||
    categoriesQuery.isLoading
  ) {
    return <div>Loading...</div>
  }

  if (productsQuery.isError || !productsQuery.data) {
    return <div>Не удалось загрузить товары</div>
  }

  const totalPages = Math.max(
    1,
    Math.ceil(productsQuery.data.total / productsQuery.data.per_page)
  )

  return (
    <div className="p-6">

      <div className="flex justify-between mb-5">

        <h1 className="text-3xl font-bold">
          Products
        </h1>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleOpenCreate}
          type="button"
        >
          Add Product
        </button>

      </div>

      <ProductFilters categories={categoriesQuery.data ?? []} onChange={handleFiltersChange} />

      <table className="w-full mt-5">

        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {productsQuery.data.items.map(
            (product: any) => (
              <tr key={product.id}>

                <td>
                  {product.name}
                </td>

                <td>
                  {product.price}
                </td>

                <td>
                  {
                    product.stock_quantity
                  }
                </td>

                <td>
                  <button
                    className="bg-yellow-400 text-black px-3 py-1 rounded mr-2"
                    onClick={() => handleOpenEdit(product.id)}
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      const confirmed = window.confirm("Delete this product?")

                      if (confirmed) {
                        deleteMutation.mutate(product.id)
                      }
                    }}
                    type="button"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            )
          )}
        </tbody>

      </table>

      <div className="flex gap-2 mt-6 items-center">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page === 1}
          onClick={handlePrevPage}
          type="button"
        >
          ←
        </button>

        <span>
          Страница: {page} / {totalPages}
        </span>

        <button
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page === totalPages}
          onClick={handleNextPage}
          type="button"
        >
          →
        </button>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {modalMode === "create" ? "Add Product" : "Edit Product"}
              </h2>

              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={handleCloseModal}
                type="button"
              >
                ✕
              </button>
            </div>

            {modalMode === "edit" && selectedProductQuery.isLoading ? (
              <div className="py-10 text-center text-slate-400">Loading product...</div>
            ) : (
            <div className="grid gap-3">
              <input
                className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <textarea
                className="min-h-28 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  placeholder="Price"
                  step="0.01"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                />

                <input
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  placeholder="Stock quantity"
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock_quantity: e.target.value,
                    })
                  }
                />
              </div>

              {modalMode === "create" && (
                <select
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select category</option>
                  {Array.isArray(categoriesQuery.data) &&
                    categoriesQuery.data.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              )}

              {modalMode === "edit" && selectedProductQuery.data?.images?.[0] && (
                <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                  <div className="text-sm text-slate-400">Current image</div>
                  <img
                    alt={selectedProductQuery.data.name}
                    className="h-48 w-full rounded-lg bg-slate-950 object-contain"
                    src={
                      import.meta.env.VITE_API_BASE_URL +
                      selectedProductQuery.data.images[0].image_url
                    }
                  />

                  <button
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                    disabled={removeImageMutation.isPending}
                    onClick={() => removeImageMutation.mutate()}
                    type="button"
                  >
                    {removeImageMutation.isPending ? "Removing..." : "Remove image"}
                  </button>
                </div>
              )}

              <input
                className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-emerald-400"
                accept="image/*"
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
                  onClick={handleCloseModal}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  onClick={() => {
                    if (modalMode === "create") {
                      createMutation.mutate()
                    } else {
                      updateMutation.mutate()
                    }
                  }}
                  type="button"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create"
                      : "Save changes"}
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
