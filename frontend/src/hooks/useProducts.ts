import { useQuery } from "@tanstack/react-query"
import { getProducts } from "../api/products"

export const useProducts = (page: number) => {
  return useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts(page),
  })
}
