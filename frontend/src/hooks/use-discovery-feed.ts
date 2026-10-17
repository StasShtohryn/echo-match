import { useCallback, useEffect, useRef, useState } from "react"
import {
  createSwipe,
  getDiscoveryFeed,
  undoSwipe,
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
  const [isUndoing, setIsUndoing] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [lastSwipe, setLastSwipe] = useState<SwipeResult | null>(null)
  const [lastSwipedCandidate, setLastSwipedCandidate] = useState<DiscoveryCandidate | null>(null)
  const requestId = useRef(0)
  const canRefill = useRef(true)

  const loadFeed = useCallback(async (replace = false) => {
    const currentRequestId = ++requestId.current
    if (replace) canRefill.current = true
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
      if (currentRequestId === requestId.current) {
        canRefill.current = false
        setError(nextError)
      }
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
    if (!candidate || isSwiping || isUndoing) return null

    setIsSwiping(true)
    setError(null)
    try {
      const result = await createSwipe(candidate.profile.id, direction)
      setCandidates((current) => current.filter((item) => item.profile.id !== candidate.profile.id))
      setLastSwipe(result)
      setLastSwipedCandidate(result.isMatch ? null : candidate)
      return result
    } catch (nextError) {
      setError(nextError)
      return null
    } finally {
      setIsSwiping(false)
    }
  }, [candidates, isSwiping, isUndoing])

  const undoLastSwipe = useCallback(async () => {
    if (!lastSwipedCandidate || isSwiping || isUndoing) return

    setIsUndoing(true)
    setError(null)
    try {
      await undoSwipe(lastSwipedCandidate.profile.id)
      requestId.current += 1
      setCandidates((current) => [
        lastSwipedCandidate,
        ...current.filter((candidate) => candidate.profile.id !== lastSwipedCandidate.profile.id),
      ])
      setStatus("Ready")
      setIsLoading(false)
      setLastSwipe(null)
      setLastSwipedCandidate(null)
    } catch (nextError) {
      setError(nextError)
      throw nextError
    } finally {
      setIsUndoing(false)
    }
  }, [isSwiping, isUndoing, lastSwipedCandidate])

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
    isUndoing,
    error,
    lastSwipe,
    canUndo: lastSwipedCandidate !== null,
    swipe,
    undoLastSwipe,
    refresh,
    dismissSwipeResult: () => setLastSwipe(null),
  }
}