import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://localhost:7203/api",
  headers: {
    "Content-Type": "application/json",
  },
})
