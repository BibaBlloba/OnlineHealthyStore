import { create } from "zustand"

import {
  addCartItem,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "../api/cart"
import type { Cart, CartItem } from "../types/cart"

type CartStore = {
  cart: Cart | null
  items: CartItem[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  loadCart: () => Promise<Cart | null>
  addProduct: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  reset: () => void
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Не удалось обновить корзину"

export const useCart = create<CartStore>((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadCart: async () => {
    set({ isLoading: true, error: null })

    try {
      const cart = await getCart()

      set({
        cart,
        items: cart.items ?? [],
        isLoading: false,
        error: null,
      })

      return cart
    } catch (error) {
      set({
        cart: null,
        items: [],
        isLoading: false,
        error: getErrorMessage(error),
      })

      return null
    }
  },

  addProduct: async (productId, quantity = 1) => {
    set({ isSaving: true, error: null })

    try {
      const cart = get().cart ?? (await get().loadCart())

      if (!cart) {
        throw new Error("Корзина недоступна")
      }

      await addCartItem({
        product_id: productId,
        quantity,
        cart_id: cart.id,
      })

      await get().loadCart()
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isSaving: true, error: null })

    try {
      if (quantity <= 0) {
        await deleteCartItem(itemId)
      } else {
        await updateCartItem(itemId, { quantity })
      }

      await get().loadCart()
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  removeItem: async (itemId) => {
    set({ isSaving: true, error: null })

    try {
      await deleteCartItem(itemId)
      await get().loadCart()
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  clearCart: async () => {
    set({ isSaving: true, error: null })

    try {
      await Promise.all(get().items.map((item) => deleteCartItem(item.id)))
      await get().loadCart()
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  reset: () =>
    set({
      cart: null,
      items: [],
      isLoading: false,
      isSaving: false,
      error: null,
    }),
}))
