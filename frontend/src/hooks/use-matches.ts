import { useCallback, useEffect, useState } from "react"
import { getMatches } from "@/services/match-service"
import type { Match } from "@/types/match.types"

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      setMatches(await getMatches())
    } catch {
      setMatches([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { matches, isLoading, refresh }
}