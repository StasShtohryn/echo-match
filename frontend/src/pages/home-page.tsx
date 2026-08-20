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

export default function HomePage() {

return (
  <div className="flex flex-col h-screen items-center justify-center gap-4">
    <Card className="overflow-hidden relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
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
        </CardAction>
        <CardTitle>
          <p className="text-lg">Оксана, 29</p>
          <p className="text-sm text-muted-foreground">Київ</p>
        </CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <Badge>
          Архітектор
        </Badge>
        <Badge>
          Мистецтво
        </Badge>
        <Badge>
          Програмування
        </Badge>
        <Badge>
          +2
        </Badge>
      </CardFooter>
    </Card>
    <Card className="flex flex-row gap-4 justify-center items-center py-2 px-4 ">
      <Button variant={"outline"} size={"icon-lg"} className="h-11 w-11 cursor-pointer">
        <Undo2 />
      </Button>
      <Button variant={"outline"} size={"icon-lg"} className="h-12 w-12 cursor-pointer">
        <X />
      </Button>
      <Button variant={"outline"} size={"icon-lg"} className="h-11 w-11 cursor-pointer">
        <Star />
      </Button>
      <Button size={"icon-lg"} className="h-12 w-12 cursor-pointer">
        <Heart />
      </Button>
    </Card>
  </div>
 )
}