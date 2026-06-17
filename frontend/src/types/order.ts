import type { CartProduct } from "./cart"

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: string
  product: CartProduct
}

export interface OrderPayment {
  id: number
  order_id: number
  amount: string
  status: string
  transaction_id: string
}

export interface Order {
  id: number
  user_id: number
  total_price: string
  status: string
  items: OrderItem[]
  payment: OrderPayment | null
}