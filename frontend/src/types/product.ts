export interface ProductImage {
  id: number
  image_url: string
  product_id: number
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock_quantity: number
  category_id: number
  images: ProductImage[]
}

export interface ProductListResponse {
  items: Product[]
  page: number
  per_page: number
  total: number
}
