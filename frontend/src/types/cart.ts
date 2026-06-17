import type { ProductImage } from "./product"

export interface CartProduct {
  id: number
  name: string
  description: string
  price: string
  stock_quantity: number
  category_id: number
  images: ProductImage[]
}

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  quantity: number
  product: CartProduct
}

export interface Cart {
  id: number
  user_id: number
  items: CartItem[]
}