import { api } from "./client"

export const register = async (data: {
  email: string
  first_name: string
  last_name: string
  password: string
}) => {
  const res = await api.post("/auth/register", data)
  return res.data
}

export const login = async (data: {
  email: string
  password: string
}) => {
  const res = await api.post("/auth/login", data)
  return res.data
}

export const logout = async () => {
  const res = await api.post("/auth/logout")
  return res.data
}

export const me = async () => {
  const res = await api.get("/auth/me")
  return res.data
}
