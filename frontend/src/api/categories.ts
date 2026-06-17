import { privateApi } from "./client"

export interface Category {
  id: number
  name: string
}

export const getCategories = async () => {
  const res = await privateApi.get("/categories/")
  return res.data
}

export const createCategory = async (name: string) => {
  const res = await privateApi.post("/categories/", { name })
  return res.data
}

export const updateCategory = async (categoryId: number, name: string) => {
  const res = await privateApi.patch(`/categories/${categoryId}`, { name })
  return res.data
}

export const deleteCategory = async (categoryId: number) => {
  const res = await privateApi.delete(`/categories/${categoryId}`)
  return res.data
}
