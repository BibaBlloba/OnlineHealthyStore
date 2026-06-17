import { publicApi } from "./client"

export const getCategories = async () => {
  const res = await publicApi.get("/categories/")
  return res.data
}
