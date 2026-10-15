import { api } from "@/services/api"
import type { Match } from "@/types/match.types"

export interface MatchCounts {
  total: number
  unseen: number
}

export async function getMatches(): Promise<Match[]> {
  const response = await api.get<Match[]>("/matches")
  return response.data
}

export async function getMatchCounts(): Promise<MatchCounts> {
  const response = await api.get<MatchCounts>("/matches/count")
  return response.data
}