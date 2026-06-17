import { privateApi, publicApi } from "./client"

export const getProducts = async (params: any) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    )
  )

  const res = await privateApi.get("/products/", {
    params: cleanParams,
  })

  return res.data
}

export const getProduct = async (id: number) => {
  const res = await privateApi.get(`/products/${id}`)

  return res.data
}

export const createProduct = async (data: any) => {
  const res = await privateApi.post("/products/", data)

  return res.data
}

export const updateProduct = async (
  id: number,
  data: any
) => {
  const res = await privateApi.patch(
    `/products/${id}`,
    data
  )

  return res.data
}

export const deleteProduct = async (
  id: number
) => {
  return privateApi.delete(`/products/${id}`)
}

export const uploadProductImage = async (
  id: number,
  file: File
) => {
  const formData = new FormData()

  formData.append("file", file)

  return privateApi.patch(
    `/products/${id}/image`,
    formData
  )
}

export const deleteProductImage = async (
  id: number
) => {
  return privateApi.delete(
    `/products/${id}/image`
  )
}
