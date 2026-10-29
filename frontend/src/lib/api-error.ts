import axios from "axios"

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const responseData = error.response?.data
  if (typeof responseData === "object" && responseData !== null) {
    if ("errors" in responseData && typeof responseData.errors === "object" && responseData.errors !== null) {
      const first = Object.values(responseData.errors as Record<string, unknown>)
        .flat()
        .find((message): message is string => typeof message === "string")
      if (first) {
        return first
      }
    }

    if ("detail" in responseData && typeof responseData.detail === "string") {
      return responseData.detail
    }
    if ("message" in responseData && typeof responseData.message === "string") {
      return responseData.message
    }
  }

  return error.message || fallback
}
