import { privateApi } from "./client"

export const getCategories = async () => {
  const res = await privateApi.get("/categories/")
  return res.data
}
