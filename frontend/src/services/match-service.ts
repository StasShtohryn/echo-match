import { api } from "@/services/api"
import type { Match } from "@/types/match.types"

export interface MatchCounts {
  total: number
  unseen: number
}

export interface MatchCompatibility {
  sharedInterests: string[]
  sharedLanguages: string[]
  sharedGoal: string | null
  distanceKm: number | null
  summary: string | null
}

export async function getMatches(): Promise<Match[]> {
  const response = await api.get<Match[]>("/matches")
  return response.data
}

export async function getMatchCounts(): Promise<MatchCounts> {
  const response = await api.get<MatchCounts>("/matches/count")
  return response.data
}

export async function markMatchAsRead(matchId: string): Promise<void> {
  await api.post(`/matches/${matchId}/seen`)
}

export async function getMatchCompatibility(matchId: string): Promise<MatchCompatibility> {
  const response = await api.get<MatchCompatibility>(`/matches/${matchId}/compatibility`)
  return response.data
}
