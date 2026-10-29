import { useEffect, useState } from "react"
import { Heart, MessageCircle, Sparkles, MapPin, X, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMatchCompatibility, type MatchCompatibility } from "@/services/match-service"
import type { DiscoveryCandidate, PublicProfile } from "@/services/auth-service"
import { GOAL_OPTIONS } from "@/lib/some-lookups"

interface MatchModalProps {
  isOpen: boolean
  matchId: string | null
  partner: DiscoveryCandidate["profile"] | null
  myProfile: PublicProfile | null
  onClose: () => void
  onOpenChat: (matchId: string) => void
}

function getInitials(name?: string): string {
  if (!name) return ""
  return name.trim().slice(0, 2).toUpperCase()
}

export function MatchModal({
  isOpen,
  matchId,
  partner,
  myProfile,
  onClose,
  onOpenChat,
}: MatchModalProps) {
  const [compatibility, setCompatibility] = useState<MatchCompatibility | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !matchId) {
      setCompatibility(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let isCancelled = false
    setIsLoading(true)
    setError(null)

    getMatchCompatibility(matchId)
      .then((data) => {
        if (!isCancelled) {
          setCompatibility(data)
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Помилка завантаження сумісності метча:", err)
          setError("Не вдалося завантажити детальний аналіз сумісності")
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen, matchId])

  if (!isOpen) return null

  const partnerName = partner?.displayName ?? "Співрозмовник"
  const partnerAge = partner?.age
  const partnerPhoto = partner?.photos?.[0]?.url

  const myName = myProfile?.displayName ?? "Ви"
  const myPhoto = myProfile?.photos?.[0]?.url

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-7 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Закрити"
        >
          <X className="size-5" />
        </button>

        {/* Аватари пари з серцем */}
        <div className="relative mx-auto mt-2 flex items-center justify-center">
          <div className="relative flex items-center justify-center -space-x-5">
            <Avatar className="size-20 border-4 border-background shadow-lg sm:size-24">
              <AvatarImage src={myPhoto} alt={myName} />
              <AvatarFallback className="text-base font-semibold">{getInitials(myName)}</AvatarFallback>
            </Avatar>

            <div className="relative z-10 flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md ring-4 ring-background animate-pulse">
              <Heart className="size-5 fill-current" />
            </div>

            <Avatar className="size-20 border-4 border-background shadow-lg sm:size-24">
              <AvatarImage src={partnerPhoto} alt={partnerName} />
              <AvatarFallback className="text-base font-semibold">{getInitials(partnerName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Заголовок */}
        <div className="mt-4 space-y-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            У вас метч!
          </h2>
          <p className="text-sm text-muted-foreground">
            Ви та <span className="font-semibold text-foreground">{partnerName}</span> сподобалися одне одному
          </p>
        </div>

        {/* Секція аналізу сумісності */}
        <div className="mt-5 space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <LoaderCircle className="size-4 animate-spin" />
                <Sparkles className="size-3.5 text-primary" />
                <span>ШІ аналізує вашу сумісність...</span>
              </div>
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
              <div className="pt-1 flex gap-2">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
            </div>
          ) : compatibility ? (
            <div className="space-y-3">
              {/* AI Summary */}
              {compatibility.summary && (
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 text-left shadow-sm">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>ШІ-аналіз сумісності</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-foreground italic">
                    «{compatibility.summary}»
                  </p>
                </div>
              )}

              {/* Загальні деталі (дистанція, мета) */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
                {compatibility.distanceKm !== null && (
                  <div className="flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1">
                    <MapPin className="size-3 text-primary" />
                    <span>~{compatibility.distanceKm} км поруч</span>
                  </div>
                )}
                {compatibility.sharedGoal && (
                  <div className="flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1">
                    <Heart className="size-3 text-rose-500" />
                    <span>{GOAL_OPTIONS[compatibility.sharedGoal] ?? compatibility.sharedGoal}</span>
                  </div>
                )}
              </div>

              {/* Спільні інтереси */}
              {compatibility.sharedInterests.length > 0 && (
                <div className="space-y-1.5 text-left">
                  <span className="text-xs font-medium text-muted-foreground">
                    Спільні інтереси ({compatibility.sharedInterests.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {compatibility.sharedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="rounded-lg px-2.5 py-0.5 text-xs font-medium bg-secondary/80 hover:bg-secondary"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Спільні мови */}
              {compatibility.sharedLanguages.length > 0 && (
                <div className="space-y-1.5 text-left">
                  <span className="text-xs font-medium text-muted-foreground">
                    Спільні мови:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {compatibility.sharedLanguages.map((language) => (
                      <Badge
                        key={language}
                        variant="outline"
                        className="rounded-lg px-2.5 py-0.5 text-xs font-medium"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">
              Ви готові до знайомства! Напишіть перше повідомлення, щоб розпочати діалог.
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ви можете написати прямо зараз або продовжити перегляд анкет.
            </p>
          )}
        </div>

        {/* Кнопки дій */}
        <div className="mt-6 flex flex-col gap-2">
          {matchId && (
            <Button
              className="w-full gap-2 h-10 text-sm font-semibold cursor-pointer"
              onClick={() => onOpenChat(matchId)}
            >
              <MessageCircle className="size-5" />
              Написати
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

