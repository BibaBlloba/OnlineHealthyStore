import { useEffect } from "react"

import { me } from "../api/auth"
import { useCart } from "../store/cart"
import { useAuth } from "../store/auth"

export const useCurrentUser = () => {
  const setUser = useAuth((s) => s.setUser)
  const loadCart = useCart((s) => s.loadCart)
  const resetCart = useCart((s) => s.reset)

  useEffect(() => {
    me()
      .then((user) => {
        setUser(user)
        void loadCart()
      })
      .catch(() => {
        setUser(null)
        resetCart()
      })
  }, [loadCart, resetCart, setUser])
}
