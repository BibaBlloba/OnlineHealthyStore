import { useMutation } from "@tanstack/react-query"
import { login, register } from "../api/auth"
import { useAuth } from "../store/auth"
import { useCart } from "../store/cart"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useLogin = () => {
  const setUser = useAuth((s) => s.setUser)
  const loadCart = useCart((s) => s.loadCart)

  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const user = await res.json()
        setUser(user)
        await loadCart()
      } catch {
        setUser(null)
        useCart.getState().reset()
      }
    },
  })
}

export const useRegister = () => {
  const setUser = useAuth((s) => s.setUser)
  const loadCart = useCart((s) => s.loadCart)

  return useMutation({
    mutationFn: register,
    onSuccess: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        })

        if (!res.ok) {
          setUser(null)
          useCart.getState().reset()
          return
        }

        const user = await res.json()
        setUser(user)
        await loadCart()
      } catch {
        setUser(null)
        useCart.getState().reset()
      }
    },
  })
}
