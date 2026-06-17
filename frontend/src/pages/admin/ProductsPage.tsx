import { useState } from "react"

import { useQuery } from "@tanstack/react-query"

import ProductFilters from "../../components/admin/ProductFilters"

import { getProducts } from "../../api/products"
import { getCategories } from "../../api/categories"

export default function ProductsPage() {

  const [filters, setFilters] =
    useState({})

  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      getProducts(filters),
  })

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

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
        >
          Add Product
        </button>

      </div>

      <ProductFilters
        categories={categoriesQuery.data}
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
                  <button className="bg-yellow-400 text-black px-3 py-1 rounded mr-2">
                    Edit
                  </button>

                  <button className="bg-red-600 text-white px-3 py-1 rounded">
                    Delete
                  </button>

                </td>

              </tr>
            )
          )}
        </tbody>

      </table>

    </div>
  )
}
