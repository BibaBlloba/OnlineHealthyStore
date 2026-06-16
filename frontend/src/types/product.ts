export type Product = {
  id: number
  name: string
  price: number
}

export type ProductsResponse = {
  items: Product[]
  page: number
  per_page: number
  total: number
}
