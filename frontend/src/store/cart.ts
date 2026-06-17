import { create } from "zustand"

type CartItem = {
  id: number
  name: string
  price: number
  qty: number
}

type CartStore = {
  items: CartItem[]
  add: (item: Omit<CartItem, "qty">) => void
  remove: (id: number) => void
  clear: () => void
}

export const useCart = create<CartStore>((set) => ({
  items: [],

  add: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }

      return {
        items: [...state.items, { ...item, qty: 1 }],
      }
    }),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clear: () => set({ items: [] }),
}))
