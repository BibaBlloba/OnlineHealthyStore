import { privateApi } from "./client"

export type AdminUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  role_id: number
  [key: string]: unknown
}

const normalizeUsersResponse = (payload: unknown): AdminUser[] => {
  if (Array.isArray(payload)) {
    return payload as AdminUser[]
  }

  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown; users?: unknown }).data
    if (Array.isArray(data)) {
      return data as AdminUser[]
    }

    const users = (payload as { data?: unknown; users?: unknown }).users
    if (Array.isArray(users)) {
      return users as AdminUser[]
    }
  }

  return []
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

export const getUsers = async (params: { page?: number; per_page?: number } = {}) => {
  const res = await privateApi.get<AdminUser[]>("/auth/", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
    },
  })
  return normalizeUsersResponse(res.data)
}

export const deleteUser = async (userId: number) => {
  const res = await privateApi.delete(`/auth/${userId}`)
  return res.data
}
