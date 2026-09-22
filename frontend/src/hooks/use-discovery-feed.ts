import { useCallback, useEffect, useRef, useState } from "react"
import {
  createSwipe,
  getDiscoveryFeed,
  type DiscoveryCandidate,
  type DiscoveryStatus,
  type SwipeDirection,
  type SwipeResult,
} from "@/services/auth-service"

const FEED_LIMIT = 20
const REFILL_THRESHOLD = 3

export function useDiscoveryFeed() {
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([])
  const [status, setStatus] = useState<DiscoveryStatus>("Ready")
  const [isLoading, setIsLoading] = useState(true)
  const [isSwiping, setIsSwiping] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [lastSwipe, setLastSwipe] = useState<SwipeResult | null>(null)
  const requestId = useRef(0)
  const canRefill = useRef(true)

  const loadFeed = useCallback(async (replace = false) => {
    const currentRequestId = ++requestId.current
    setIsLoading(true)
    setError(null)

    try {
      const feed = await getDiscoveryFeed(FEED_LIMIT)
      if (currentRequestId !== requestId.current) return

      setStatus(feed.status)
      setCandidates((current) => {
        const existing = replace ? [] : current
        const existingIds = new Set(existing.map((candidate) => candidate.profile.id))
        canRefill.current = feed.candidates.some((candidate) => !existingIds.has(candidate.profile.id))
        const byId = new Map(existing.map((candidate) => [candidate.profile.id, candidate]))
        for (const candidate of feed.candidates) {
          byId.set(candidate.profile.id, candidate)
        }
        return [...byId.values()]
      })
    } catch (nextError) {
      if (currentRequestId === requestId.current) setError(nextError)
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFeed(true)
  }, [loadFeed])

  useEffect(() => {
    if (!isLoading && canRefill.current && status === "Ready" && candidates.length <= REFILL_THRESHOLD) {
      void loadFeed()
    }
  }, [candidates.length, isLoading, loadFeed, status])

  const swipe = useCallback(async (direction: SwipeDirection) => {
    const candidate = candidates[0]
    if (!candidate || isSwiping) return null

    setIsSwiping(true)
    setError(null)
    try {
      const result = await createSwipe(candidate.profile.id, direction)
      setCandidates((current) => current.filter((item) => item.profile.id !== candidate.profile.id))
      setLastSwipe(result)
      return result
    } catch (nextError) {
      setError(nextError)
      return null
    } finally {
      setIsSwiping(false)
    }
  }, [candidates, isSwiping])

  const refresh = useCallback(() => {
    setLastSwipe(null)
    return loadFeed(true)
  }, [loadFeed])

  return {
    candidates,
    currentCandidate: candidates[0] ?? null,
    status,
    isLoading,
    isSwiping,
    error,
    lastSwipe,
    swipe,
    refresh,
    dismissSwipeResult: () => setLastSwipe(null),
  }
}