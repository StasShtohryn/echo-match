"use client"
import { useState, useRef, useEffect } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"

// Типізація повідомлення
export interface IMessage {
  id: string
  sender: "me" | "match"
  text: string
  reactions?: string[]
  status?: "sent" | "delivered" | "read"
  timestamp?: string
}

// Початкові дані (приклад)
const INITIAL_MESSAGES: IMessage[] = [
  { id: "1", sender: "me", text: "Вітаю! Як в тебе справи?", status: "read" },
  { id: "2", sender: "match", text: "Доброго вечора, все чудово, а ти як?" },
  { id: "3", sender: "me", text: "Теж добре, як проходить твій день?", status: "read" },
  { id: "4", sender: "match", text: "Трохи втомилася на навчанні 😭.", reactions: ["👍"] },
  { id: "5", sender: "match", text: "Складала іспит." },
  { id: "6", sender: "me", text: "Не хвилюйся, все буде добре!!" },
  { id: "7", sender: "me", text: "Ти точно з усім впораєшся 💪", status: "read" },
  { id: "8", sender: "match", text: "Дякую за підтримку! ❤️" },
]

export default function MessengerPage() {

  const [messages, setMessages] = useState<IMessage[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Ref для автоматичного скролу вниз
  const viewportRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior,
      })
    }
  }
  // При першому рендері або оновленні списку повідомлень прокручуємо вниз
  useEffect(() => {
    scrollToBottom("auto")
  }, [messages, isTyping])

  // Відправка повідомлення
  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: IMessage = {
      id: Date.now().toString(),
      sender: "me",
      text: inputValue.trim(),
      status: "sent",
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col p-4">
      <ScrollArea viewportRef={viewportRef} className="relative h-full min-h-0 flex-1 px-4">
        <div className="flex flex-col gap-6 pb-4">

          {messages.map((msg, index) => {
            const isMe = msg.sender === "me"
            const showFooter = isMe && msg.status === "read" && index === messages.length - 1

            return (
              <Message key={msg.id} align={isMe ? "end" : "start"}>
                <MessageAvatar>
                  <Avatar>
                    <AvatarImage
                      src={isMe ? "/avatars/10.png" : "/avatars/02.png"}
                      alt={isMe ? "@me" : "@match"}
                    />
                    <AvatarFallback>{isMe ? "ME" : "М"}</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <BubbleGroup>
                    <Bubble variant={isMe ? "default" : "muted"}>
                      <BubbleContent
                        className={
                          !isMe ? "border-border bg-card! shadow-sm" : undefined
                        }
                      >
                        {msg.text}
                      </BubbleContent>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <BubbleReactions aria-label={`Reactions: ${msg.reactions.join(", ")}`}>
                          {msg.reactions.map((r, i) => (
                            <span key={i}>{r}</span>
                          ))}
                        </BubbleReactions>
                      )}
                    </Bubble>
                  </BubbleGroup>
                  {showFooter && <MessageFooter>Переглянуто</MessageFooter>}
                </MessageContent>
              </Message>
            )
          })}

          {isTyping && (
            <Marker role="status">
              <MarkerContent className="shimmer">
                <span className="font-medium">Марія</span> пише...
              </MarkerContent>
            </Marker>
          )}

        </div>
      </ScrollArea>

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
        <Input placeholder="Введіть повідомлення..." className="h-10 border-border bg-card shadow-sm" value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button size="icon" className="h-10 w-10 shadow-sm" onClick={handleSendMessage}>
          <Send />
        </Button>
      </div>
    </div>
  )
}
