import { useQuery } from "@tanstack/react-query"
import { getProducts } from "../api/products"

export const useProducts = (
  page: number,
  filters: Record<string, unknown> = {},
  perPage = 9
) => {
  return useQuery({
    queryKey: ["products", page, filters, perPage],
    queryFn: () =>
      getProducts({
        ...filters,
        page,
        per_page: perPage,
      }),
  })
}
