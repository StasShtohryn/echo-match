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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getLabel,
  ORIENTATION_OPTIONS,
  LOVE_STYLE_OPTIONS,
  GOAL_OPTIONS,
  FAMILY_PLAN_OPTIONS,
  PET_OPTIONS,
  WORKOUT_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  COMMUNICATION_OPTIONS,
  ZODIAC_OPTIONS,
} from "@/lib/some-lookups"



const SWIPE_THRESHOLD = 100

interface PersonCardProps {
  candidate: DiscoveryCandidate
  isSwiping?: boolean
  isUndoing?: boolean
  canUndo?: boolean
  onSwipe: (direction: SwipeDirection) => void
  onUndo: () => void
}

export default function PersonCard({
  candidate,
  isSwiping = false,
  isUndoing = false,
  canUndo = false,
  onSwipe,
  onUndo,
}: PersonCardProps) {
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  useEffect(() => {
    setDragOffset(0)
    setExitDirection(null)
    setLightboxIndex(null)
    setIsProfileModalOpen(false)
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
    const target = event.target as HTMLElement | null
    if (
      target &&
      (target.closest('[data-slot="carousel"]') || target.closest('[data-modal-trigger="true"]'))
    ) {
      return // Ігноруємо свайпи при кліку на карусель чи ім'я
    }

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

  const rawDetails = [
    { label: "Місто", value: profile.city },
    { label: "Вік", value: profile.age ? `${profile.age} років` : null },
    { label: "Орієнтація", value: getLabel(ORIENTATION_OPTIONS, profile.orientation) },
    { label: "Мова кохання", value: getLabel(LOVE_STYLE_OPTIONS, profile.loveLanguage) },
    { label: "Стиль спілкування", value: getLabel(COMMUNICATION_OPTIONS, profile.communication) },
    { label: "Шукає", value: getLabel(GOAL_OPTIONS, profile.lookingFor) },
    { label: "Знак зодіаку", value: getLabel(ZODIAC_OPTIONS, profile.zodiac) },
    { label: "Плани на сім'ю", value: getLabel(FAMILY_PLAN_OPTIONS, profile.familyPlans) },
    { label: "Домашні тварини", value: getLabel(PET_OPTIONS, profile.pets) },
    { label: "Освіта", value: profile.school },
    { label: "Рід занять", value: profile.occupation },
    { label: "Компанія", value: profile.company },
    { label: "Спорт", value: getLabel(WORKOUT_OPTIONS, profile.workout) },
    { label: "Зріст", value: profile.heightCm ? `${profile.heightCm} см` : null },
    { label: "Алкоголь", value: getLabel(DRINKING_OPTIONS, profile.drinking) },
    { label: "Куріння", value: getLabel(SMOKING_OPTIONS, profile.smoking) },
  ]

  const availableDetails = rawDetails.filter((item) => Boolean(item.value))

  const mainPhoto = photos.find((p) => p.isMain) ?? photos[0]
  const initials = profile.displayName
    ? profile.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <div className="my-auto flex w-full max-w-110 shrink-0 flex-col gap-4 py-1 select-none">
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
                    className="block size-full cursor-e-resize"
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
            <div className="flex items-center gap-1.5">
              <span
                role="button"
                tabIndex={0}
                data-modal-trigger="true"
                className="group inline-flex items-center cursor-pointer select-none transition-all"
                onPointerDown={(e) => {
                  // Блокуємо свайп картки тільки при натисканні на ім'я
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsProfileModalOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    setIsProfileModalOpen(true)
                  }
                }}
              >
                <span className="text-2xl transition-all duration-150 group-hover:text-primary group-hover:underline group-hover:decoration-primary/60 group-hover:underline-offset-4">
                  {profile.displayName}
                </span>
                <span className="text-2xl">, {profile.age}</span>
              </span>
            </div>

            <p className="text-md text-muted-foreground mt-0.5">
              {candidate.distanceKm === null ? "Відстань не вказана" : `${candidate.distanceKm} км від вас`}
            </p>
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
      </Card >

      <div className="flex flex-row gap-4 justify-center items-center" >
        <Card className="flex flex-row items-center gap-4 py-2 px-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="h-11 w-11 cursor-pointer"
            disabled={!canUndo || isSwiping || isUndoing}
            aria-label="Повернути попередню анкету"
            title="Повернути попередню анкету"
            onClick={onUndo}
          >
            <Undo2 />
          </Button>
          <Button variant={"outline"} size={"icon-lg"} className="h-12 w-12 cursor-pointer" disabled={isSwiping || isUndoing} onClick={() => onSwipe("Dislike")}>
            <X />
          </Button>
          <Button variant={"outline"} size={"icon-lg"} className="h-11 w-11 cursor-pointer" disabled>
            <Star />
          </Button>
          <Button size={"icon-lg"} className="h-12 w-12 cursor-pointer" disabled={isSwiping || isUndoing} onClick={() => onSwipe("Like")}>
            <Heart />
          </Button>
        </Card>
      </div>


      <Dialog.Root open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <Dialog.Portal>

          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 outline-none">
            <Dialog.Title className="sr-only">
              Профіль користувача {profile.displayName}
            </Dialog.Title>
            <div className="relative flex h-[88vh] w-full max-w-4xl flex-col rounded-3xl border border-border bg-background text-foreground shadow-2xl overflow-hidden">              {/* Кнопка закриття */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-20 rounded-full bg-background/80 backdrop-blur-md hover:bg-accent"
                onClick={() => setIsProfileModalOpen(false)}
              >
                <X className="size-5" />
              </Button>

              <ScrollArea className="flex-1 min-h-0 p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Шапка профілю */}
                  <div className="flex flex-col items-center text-center pt-2">
                    <Avatar className="size-24 border-2 border-primary/20">
                      <AvatarImage src={mainPhoto?.url} alt={profile.displayName} />
                      <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="mt-3 flex items-center gap-1.5">
                      <h2 className="text-2xl font-bold">{profile.displayName}, {profile.age}</h2>
                      {profile.isFaceVerified && (
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-primary">
                              <BadgeCheck className="size-5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Користувач пройшов верифікацію</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {profile.city && (
                      <p className="text-sm text-muted-foreground mt-0.5">{profile.city}</p>
                    )}
                  </div>

                  {/* Опис "Про себе" */}
                  {profile.bio && (
                    <Card className="p-4 bg-muted/40 border-none">
                      <h3 className="text-sm font-semibold mb-1 text-muted-foreground">Про себе</h3>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                    </Card>
                  )}

                  {/* Галерея світлин */}
                  {photos.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Фотографії</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            className="aspect-square relative overflow-hidden rounded-xl border border-border/50 hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setLightboxCurrentIndex(index)
                              setLightboxIndex(index)
                            }}
                          >
                            <img src={photo.url} alt="Photo" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Основні характеристики */}
                  {availableDetails.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Інформація</h3>
                      <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                        {availableDetails.map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex justify-between items-center border-b border-border/40 pb-1.5 text-sm"
                          >
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Інтереси та мови */}
                  {(profile.interests.length > 0 || profile.languages.length > 0) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {profile.interests.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Інтереси</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.interests.map((item) => (
                              <Badge key={item.id} variant="secondary">
                                {item.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.languages.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Мови</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.languages.map((item) => (
                              <Badge key={item.id} variant="outline">
                                {item.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Відповіді на запитання */}
                  {profile.promptAnswers && profile.promptAnswers.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">Відповіді</h3>
                      {profile.promptAnswers.map((answer) => (
                        <div
                          key={answer.promptId}
                          className="rounded-xl border border-border/60 p-3 bg-card"
                        >
                          <p className="text-xs text-muted-foreground">{answer.question}</p>
                          <p className="mt-1 text-sm font-medium">{answer.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

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
    </div >
  )
}
