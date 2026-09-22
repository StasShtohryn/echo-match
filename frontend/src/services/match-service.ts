import { api } from "@/services/api"
import type { Match } from "@/types/match.types"

export async function getMatches(): Promise<Match[]> {
  const response = await api.get<Match[]>("/matches")
  return response.data
}