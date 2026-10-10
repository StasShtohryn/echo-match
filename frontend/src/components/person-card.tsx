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
import { Dialog } from "@base-ui/react/dialog"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0)
  const [lightboxCarouselApi, setLightboxCarouselApi] = useState<CarouselApi | null>(null)
  const dragStart = useRef<number | null>(null)
  const isDragging = useRef(false)
  const { profile } = candidate
  const photos = [...profile.photos].sort((left, right) => {
    if (left.isMain !== right.isMain) return left.isMain ? -1 : 1
    return left.order - right.order
  })

  useEffect(() => {
    setDragOffset(0)
    setExitDirection(null)
    setLightboxIndex(null)
    dragStart.current = null
    isDragging.current = false
  }, [candidate.profile.id])

  useEffect(() => {
    if (!lightboxCarouselApi || lightboxIndex === null) return
    const carouselApi = lightboxCarouselApi

    function handleLightboxSelect() {
      setLightboxCurrentIndex(carouselApi.selectedScrollSnap())
    }

    handleLightboxSelect()
    carouselApi.on("select", handleLightboxSelect)
    return () => {
      carouselApi.off("select", handleLightboxSelect)
    }
  }, [lightboxCarouselApi, lightboxIndex])

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest('[data-slot="carousel"]')) return
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
    <div className="my-auto flex w-full max-w-[360px] shrink-0 flex-col gap-4 py-1 select-none">
      <Card
        className="relative flex flex-col touch-pan-y overflow-hidden pt-0 select-none"
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
        <div className="absolute z-30" />
        {photos.length > 0 ? (
          <Carousel opts={{ loop: photos.length > 1 }} className="relative w-full aspect-[7/6] max-h-[min(380px,max(120px,calc(100dvh-24rem)))] shrink-0 overflow-hidden">
            <CarouselContent className="ml-0 h-full">
              {photos.map((photo, index) => (
                <CarouselItem key={photo.id} className="h-full pl-0">
                  <button
                    type="button"
                    className="block size-full cursor-zoom-in"
                    aria-label={`Збільшити фото ${index + 1} профілю ${profile.displayName}`}
                    onClick={() => {
                      setLightboxCurrentIndex(index)
                      setLightboxIndex(index)
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={`${profile.displayName}, фото ${index + 1}`}
                      className="size-full object-cover object-[center_65%]"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2 size-8 backdrop-blur-lg" />
                <CarouselNext className="right-2 size-8 backdrop-blur-lg" />
              </>
            )}
          </Carousel>
        ) : <div className="relative z-20 flex aspect-[7/6] max-h-[min(380px,max(120px,calc(100dvh-24rem)))] w-full shrink-0 items-center justify-center bg-muted text-5xl font-bold text-muted-foreground">
          {profile.displayName.charAt(0)}
        </div>}


        <CardHeader className="shrink-0">
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
            <p className="text-2xl">{profile.displayName}, {profile.age}</p>
            <p className="text-md text-muted-foreground">{candidate.distanceKm === null ? "Відстань не вказана" : `${candidate.distanceKm} км від вас`}</p>
          </CardTitle>
          <CardDescription className="text-xs">
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
        <Card className="flex flex-row items-center gap-4 py-2 px-2">
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
      <Dialog.Root
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white outline-none">
            <Dialog.Title className="sr-only">
              Фотографії профілю {profile.displayName}
            </Dialog.Title>
            {lightboxIndex !== null && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="absolute top-4 right-4 z-20 border border-white/25 bg-neutral-950/75 text-white shadow-lg hover:bg-neutral-800 hover:text-white"
                  aria-label="Закрити перегляд фотографій"
                  onClick={() => setLightboxIndex(null)}
                >
                  <X />
                </Button>
                <Carousel
                  setApi={setLightboxCarouselApi}
                  opts={{
                    startIndex: lightboxIndex,
                    loop: photos.length > 1,
                  }}
                  className="w-full max-w-5xl"
                >
                  <CarouselContent className="ml-0">
                    {photos.map((photo, index) => (
                      <CarouselItem key={photo.id} className="pl-0">
                        <img
                          src={photo.url}
                          alt={`${profile.displayName}, фото ${index + 1}`}
                          className="mx-auto h-[80vh] max-h-225 w-full object-contain"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {photos.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 size-11 rounded-full border border-white/25 bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm hover:bg-neutral-800 hover:text-white sm:left-4" />
                      <CarouselNext className="right-2 size-11 rounded-full border border-white/25 bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm hover:bg-neutral-800 hover:text-white sm:right-4" />
                    </>
                  )}
                </Carousel>
                <div
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {lightboxCurrentIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
