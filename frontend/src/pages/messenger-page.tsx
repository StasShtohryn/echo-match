import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Camera,
  FileText,
  ImageIcon,
  Paperclip,
  Send,
} from "lucide-react"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function MessengerPage() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 pt-4 pb-4">
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
        <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/10.png" alt="@me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>вітаю! як в тебе справи?</BubbleContent>
          </Bubble>
        </MessageContent>
        </Message>
        <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="@rabbit" />
            <AvatarFallback>М</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent className="border-border bg-card! shadow-sm">
              доброго вечора, все чудово, а ти як?
            </BubbleContent>
          </Bubble>
        </MessageContent>
        </Message>
        <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/10.png" alt="@me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>теж добре, фівддчлсм???.</BubbleContent>
          </Bubble>
          <MessageFooter>Переглянуто</MessageFooter>
        </MessageContent>
        </Message>
        <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="@rabbit" />
            <AvatarFallback>М</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent className="border-border bg-card! shadow-sm">
                Ічлдсом чсм л, лчсм 😭.
              </BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent className="border-border bg-card! shadow-sm">
                ЛДІв сломло.
              </BubbleContent>
              <BubbleReactions aria-label="Reactions: thumbs up">
                <span>👍</span>
              </BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
        </Message>
        <Marker role="status">
          <MarkerContent className="shimmer">
            <span className="font-medium">Марія</span> пише...
          </MarkerContent>
        </Marker>
      </div>
      <div className="flex shrink-0 flex-row items-center gap-2 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border bg-card shadow-sm hover:bg-muted"
                aria-label="Додати вкладення"
              >
                <Paperclip />
              </Button>
            }
          />
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-52">
            <DropdownMenuItem>
              <ImageIcon />
              Зображення
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText />
              Файл
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Camera />
              Камера
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input placeholder="Введіть повідомлення..." className="h-10 border-border bg-card shadow-sm"/>
        <Button size="icon" className="h-10 w-10 shadow-sm">
          <Send />
        </Button>
      </div>
    </div>
  )
}
