import { api } from "./client"
import type { ProductsResponse } from "../types/product"

export const getProducts = async (page: number = 1): Promise<ProductsResponse> => {
  const res = await api.get("/products/", {
    params: {
      page,
      per_page: 15,
    },
  })

  return res.data
}
