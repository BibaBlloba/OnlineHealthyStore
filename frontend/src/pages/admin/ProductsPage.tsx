import { useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import ProductFilters from "../../components/admin/ProductFilters"

import {
  createProduct,
  getProducts,
  uploadProductImage,
} from "../../api/products"
import { getCategories } from "../../api/categories"

const EMPTY_CREATE_FORM = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
}

export default function ProductsPage() {
  const queryClient = useQueryClient()

  const [filters, setFilters] =
    useState({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      getProducts(filters),
  })

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const createdProduct = await createProduct({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: Number(createForm.price),
        stock_quantity: Number(createForm.stock_quantity),
        category_id: Number(createForm.category_id),
      })

      if (imageFile) {
        await uploadProductImage(createdProduct.id, imageFile)
      }

      return createdProduct
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsCreateOpen(false)
      setCreateForm(EMPTY_CREATE_FORM)
      setImageFile(null)
    },
  })

  const handleOpenCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM)
    setImageFile(null)
    setIsCreateOpen(true)
  }

  if (
    productsQuery.isLoading ||
    categoriesQuery.isLoading
  ) {
    return <div>Loading...</div>
  }

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

      <ProductFilters
        categories={categoriesQuery.data ?? []}
        onChange={setFilters}
      />

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
                  <button className="bg-yellow-400 text-black px-3 py-1 rounded mr-2" type="button">
                    Edit
                  </button>

                  <button className="bg-red-600 text-white px-3 py-1 rounded" type="button">
                    Delete
                  </button>

                </td>

              </tr>
            )
          )}
        </tbody>

      </table>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Add Product
              </h2>

              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <input
                className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                placeholder="Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    name: e.target.value,
                  })
                }
              />

              <textarea
                className="min-h-28 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                placeholder="Description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
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
                  value={createForm.price}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      price: e.target.value,
                    })
                  }
                />

                <input
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  placeholder="Stock quantity"
                  type="number"
                  value={createForm.stock_quantity}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      stock_quantity: e.target.value,
                    })
                  }
                />
              </div>

              <select
                className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                value={createForm.category_id}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
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

              <input
                className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-emerald-400"
                accept="image/*"
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                  type="button"
                >
                  {createMutation.isPending ? "Saving..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
