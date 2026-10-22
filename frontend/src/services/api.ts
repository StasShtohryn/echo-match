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

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ""
      const isAuthenticationRequest = /(^|\/)auth\/(login|register|google)(\?|$)/.test(requestUrl)

      if (!isAuthenticationRequest) {
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  },
)
