import axios from "axios"

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const responseData = error.response?.data
  if (typeof responseData === "object" && responseData !== null) {
    if ("detail" in responseData && typeof responseData.detail === "string") {
      return responseData.detail
    }
    if ("message" in responseData && typeof responseData.message === "string") {
      return responseData.message
    }
  }

  return error.message || fallback
}
