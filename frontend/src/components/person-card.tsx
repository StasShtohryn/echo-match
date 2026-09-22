import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeCheck, Star, Heart, Undo2, X } from "lucide-react"
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import type { DiscoveryCandidate, SwipeDirection } from "@/services/auth-service"

const SWIPE_THRESHOLD = 100

interface PersonCardProps {
  candidate: DiscoveryCandidate
  isSwiping?: boolean
  onSwipe: (direction: SwipeDirection) => void
}

export default function PersonCard({ candidate, isSwiping = false, onSwipe }: PersonCardProps) {
  const [dragOffset, setDragOffset] = useState(0)
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null)
  const dragStart = useRef<number | null>(null)
  const isDragging = useRef(false)
  const { profile } = candidate
  const photo = [...profile.photos].sort((left, right) => {
    if (left.isMain !== right.isMain) return left.isMain ? -1 : 1
    return left.order - right.order
  })[0]

  useEffect(() => {
    setDragOffset(0)
    setExitDirection(null)
    dragStart.current = null
    isDragging.current = false
  }, [candidate.profile.id])

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isSwiping || exitDirection) return
    dragStart.current = event.clientX
    isDragging.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStart.current === null || isSwiping || exitDirection) return
    const offset = event.clientX - dragStart.current
    if (Math.abs(offset) > 6) isDragging.current = true
    setDragOffset(offset)
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return
    const offset = event.clientX - dragStart.current
    dragStart.current = null
    if (!isDragging.current) {
      setDragOffset(0)
      return
    }

    isDragging.current = false
    if (Math.abs(offset) < SWIPE_THRESHOLD || isSwiping) {
      setDragOffset(0)
      return
    }

    const direction: SwipeDirection = offset > 0 ? "Like" : "Dislike"
    setExitDirection(direction)
    setDragOffset(offset > 0 ? window.innerWidth : -window.innerWidth)
    onSwipe(direction)
  }

  function handlePointerCancel() {
    dragStart.current = null
    isDragging.current = false
    setDragOffset(0)
  }

  const cardRotation = Math.max(-12, Math.min(12, dragOffset / 18))

  return (
    <div className="flex flex-col gap-4">
      <Card
        className="relative mx-auto w-full max-w-sm touch-pan-y overflow-hidden pt-0 select-none"
        style={{
          transform: `translateX(${dragOffset}px) rotate(${cardRotation}deg)`,
          transition: dragStart.current === null ? "transform 220ms ease-out" : "none",
          cursor: isSwiping ? "wait" : isDragging.current ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
        {photo ? <img
          src={photo.url}
          alt={profile.displayName}
          className="relative z-20 aspect-video w-full object-cover"
        /> : <div className="relative z-20 flex aspect-video w-full items-center justify-center bg-muted text-5xl font-bold text-muted-foreground">
          {profile.displayName.charAt(0)}
        </div>}
        <CardHeader>
          <CardAction>
            {profile.isFaceVerified ? (
              <Tooltip>
                <TooltipTrigger >
                  <span className="text-primary hover:opacity-80 transition-opacity">
                    <BadgeCheck className="size-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-70">
                  <p>Користувач пройшов верифікацію за допомогою сервісу AWS Amazon Rekognition</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              ""
            )}

          </CardAction>
          <CardTitle>
          <p className="text-lg">{profile.displayName}, {profile.age}</p>
          <p className="text-sm text-muted-foreground">{candidate.distanceKm === null ? "Відстань не вказана" : `${candidate.distanceKm} км від вас`}</p>
          </CardTitle>
          <CardDescription>
            {profile.bio ?? "Користувач ще не додав опис профілю."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          {profile.interests.slice(0, 4).map((interest) => (
            <Badge key={interest.id}>{interest.name}</Badge>
          ))}
        </CardFooter>
      </Card>
      <div className="flex flex-row gap-4 justify-center items-center" >
        <Card className="flex flex-row items-center gap-4 py-2 px-7">
          <Button variant={"outline"} size={"icon-lg"} className="h-11 w-11 cursor-pointer" disabled>
            <Undo2 />
          </Button>
          <Button variant={"outline"} size={"icon-lg"} className="h-12 w-12 cursor-pointer" disabled={isSwiping} onClick={() => onSwipe("Dislike")}>
            <X />
          </Button>
          <Button variant={"outline"} size={"icon-lg"} className="h-11 w-11 cursor-pointer" disabled>
            <Star />
          </Button>
          <Button size={"icon-lg"} className="h-12 w-12 cursor-pointer" disabled={isSwiping} onClick={() => onSwipe("Like")}>
            <Heart />
          </Button>
        </Card>
      </div>
    </div>
  )
}

