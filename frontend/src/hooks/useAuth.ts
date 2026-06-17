import { useMutation } from "@tanstack/react-query"
import { login, register } from "../api/auth"
import { useAuth } from "../store/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useLogin = () => {
  const setUser = useAuth((s) => s.setUser)

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
      } catch {
        setUser(null)
      }
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  })
}
