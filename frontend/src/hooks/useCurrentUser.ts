import { useEffect } from "react"

import { me } from "../api/auth"
import { useAuth } from "../store/auth"

export const useCurrentUser = () => {
  const setUser = useAuth((s) => s.setUser)

  useEffect(() => {
    me()
      .then((user) => {
        setUser(user)
      })
      .catch(() => {
        setUser(null)
      })
  }, [])
}
