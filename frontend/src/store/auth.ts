import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AuthUser = {
  id?: number
  email?: string
  first_name?: string
  last_name?: string
  role_id?: number
  [key: string]: unknown
}

type AuthStore = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
)
