import { api } from "./client"

export const getProducts = async () => {
  const res = await api.get("/products")
  return res.data
}
