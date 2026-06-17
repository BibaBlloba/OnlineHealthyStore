import axios from "axios"

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const privateApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})
