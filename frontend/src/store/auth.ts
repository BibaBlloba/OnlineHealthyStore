import { create } from "zustand"

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  role_id: number
}

type AuthStore = {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),
}))
