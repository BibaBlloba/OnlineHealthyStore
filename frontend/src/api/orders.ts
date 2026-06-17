import { privateApi } from "./client"
import type { Order } from "../types/order"

export const createOrder = async () => {
  const res = await privateApi.post<Order>("/orders/create")

  return res.data
}

export const getOrders = async () => {
  const res = await privateApi.get<Order[]>("/orders")

  return res.data
}

export const getOrder = async (orderId: number) => {
  const res = await privateApi.get<Order>(`/orders/${orderId}`)

  return res.data
}

export const payOrder = async (
  orderId: number,
  data: {
    payment_method: string
  }
) => {
  const res = await privateApi.post<{ message: string }>(
    `/orders/${orderId}/pay`,
    data
  )

  return res.data
}