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
import type { DiscoveryCandidate, SwipeDirection } from "@/services/auth-service"

interface PersonCardProps {
  candidate: DiscoveryCandidate
  isSwiping?: boolean
  onSwipe: (direction: SwipeDirection) => void
}

export default function PersonCard({ candidate, isSwiping = false, onSwipe }: PersonCardProps) {
  const { profile } = candidate
  const photo = [...profile.photos].sort((left, right) => {
    if (left.isMain !== right.isMain) return left.isMain ? -1 : 1
    return left.order - right.order
  })[0]

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden relative mx-auto w-full max-w-sm pt-0">
        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
        {photo ? <img
          src={photo.url}
          alt={profile.displayName}
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
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

