import axios from "axios"
import { useAuthStore } from "@/store/useAuthStore"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
