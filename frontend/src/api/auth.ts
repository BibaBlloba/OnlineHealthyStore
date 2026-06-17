import { privateApi } from "./client"

export type AdminUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  role_id: number
  [key: string]: unknown
}

export const register = async (data: {
  email: string
  first_name: string
  last_name: string
  password: string
}) => {
  const res = await privateApi.post("/auth/register", data)
  return res.data
}

export const login = async (data: {
  email: string
  password: string
}) => {
  const res = await privateApi.post("/auth/login", data)
  return res.data
}

export const logout = async () => {
  const res = await privateApi.post("/auth/logout")
  return res.data
}

export const me = async () => {
  const res = await privateApi.get("/auth/me")
  return res.data
}

export const getUsers = async () => {
  const res = await privateApi.get<AdminUser[]>("/auth")
  return res.data
}

export const deleteUser = async (userId: number) => {
  const res = await privateApi.delete(`/auth/${userId}`)
  return res.data
}
