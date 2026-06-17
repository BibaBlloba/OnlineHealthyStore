import { privateApi } from "./client"
import type { Cart, CartItem } from "../types/cart"

export const getCart = async () => {
  const res = await privateApi.get<Cart>("/cart")

  return res.data
}

export const addCartItem = async (data: {
  product_id: number
  quantity: number
  cart_id: number
}) => {
  const res = await privateApi.post<CartItem>("/cart/items", data)

  return res.data
}

export const updateCartItem = async (
  itemId: number,
  data: {
    quantity: number
  }
) => {
  const res = await privateApi.put<CartItem>(`/cart/items/${itemId}`, data)

  return res.data
}

export const deleteCartItem = async (itemId: number) => {
  const res = await privateApi.delete<{ status: string }>(
    `/cart/items/${itemId}`
  )

  return res.data
}