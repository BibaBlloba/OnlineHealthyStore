import { privateApi } from "./client"

export type ProductReview = {
  id: number
  rating: number
  comment: string
  product_id: number
  user_id: number
}

export type ProductReviewsResponse = {
  items: ProductReview[]
  page: number
  per_page: number
  total: number
}

export const getProducts = async (
  params: number | Record<string, unknown> = 1
) => {
  const normalizedParams =
    typeof params === "number"
      ? { page: params, per_page: 15 }
      : params

  const cleanParams = Object.fromEntries(
    Object.entries(normalizedParams).filter(
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

export const getProductReviews = async (
  productId: number,
  page = 1,
  perPage = 10
): Promise<ProductReviewsResponse> => {
  const res = await privateApi.get(`/products/${productId}/reviews`, {
    params: { page, per_page: perPage },
  })

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
