import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr"
import { ArrowLeft, Check, CheckCheck, LoaderCircle, Send } from "lucide-react"
import { Link, useParams } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAuthStore } from "@/store/useAuthStore"
import type { Match } from "@/types/match.types"
import { getMatches } from "@/services/match-service"
import {
  getChatHubUrl,
  getMessages,
  markMessagesRead,
  sendMessage,
  type ChatMessage,
  type ChatMessageEvent,
  type ChatReadEvent,
  type ChatReactionEvent,
} from "@/services/message-service"

const PAGE_SIZE = 30

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value))
}

function formatConversationTime(value: string): string {
  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return formatTime(value)
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase()
}

function sortByRecentActivity(matches: Match[]): Match[] {
  return [...matches].sort((left, right) => {
    const leftActivity = left.lastMessage?.sentAt ?? left.createdAt
    const rightActivity = right.lastMessage?.sentAt ?? right.createdAt
    return new Date(rightActivity).getTime() - new Date(leftActivity).getTime()
  })
}

function reactionEmoji(reaction: string): string {
  const emoji: Record<string, string> = {
    Heart: "❤️",
    Laugh: "😂",
    Wow: "😮",
    Sad: "😢",
    Like: "👍",
    Fire: "🔥",
  }
  return emoji[reaction] ?? reaction
}

export default function MessengerPage() {
  const { matchId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [matches, setMatches] = useState<Match[]>([])
  const [isMatchesLoading, setIsMatchesLoading] = useState(true)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadedMatchId, setLoadedMatchId] = useState<string | null>(null)
  const [partnerLastReadAt, setPartnerLastReadAt] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [hasOlderMessages, setHasOlderMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const viewportRef = useRef<HTMLDivElement>(null)
  const connectionRef = useRef<HubConnection | null>(null)
  const selectedMatchIdRef = useRef(matchId)
  const partnerProfileIdRef = useRef<string | null>(null)
  const scrollToBottomRef = useRef(false)
  const previousScrollRef = useRef<{ height: number; top: number } | null>(null)

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === matchId) ?? null,
    [matches, matchId],
  )
  const visibleMessages = loadedMatchId === matchId ? messages : []

  useEffect(() => {
    selectedMatchIdRef.current = matchId
    partnerProfileIdRef.current = selectedMatch?.partner.profileId ?? null
  }, [matchId, selectedMatch?.partner.profileId])

  const refreshMatches = useCallback(async () => {
    try {
      setMatches(await getMatches())
      setMatchesError(null)
    } catch (error: unknown) {
      setMatchesError(getApiErrorMessage(error, "Не вдалося завантажити список чатів."))
    } finally {
      setIsMatchesLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(refreshMatches)
  }, [refreshMatches])

  const markRead = useCallback(async (id: string) => {
    try {
      await markMessagesRead(id)
      setMatches((current) => current.map((match) => (
        match.id === id ? { ...match, unreadCount: 0 } : match
      )))
    } catch (error: unknown) {
      setChatError(getApiErrorMessage(error, "Не вдалося позначити повідомлення прочитаними."))
    }
  }, [])

  useEffect(() => {
    if (!matchId) return

    const activeMatchId = matchId
    let cancelled = false

    async function loadConversation() {
      setLoadedMatchId(null)
      setMessages([])
      setPartnerLastReadAt(null)
      setChatError(null)
      setIsLoadingMessages(true)
      setHasOlderMessages(false)
      try {
        const page = await getMessages(activeMatchId)
        if (cancelled) return
        const chronological = [...page.items].reverse()
        setMessages(chronological)
        setLoadedMatchId(activeMatchId)
        setPartnerLastReadAt(page.partnerLastReadAt)
        setHasOlderMessages(page.items.length === PAGE_SIZE)
        scrollToBottomRef.current = true
        await markRead(activeMatchId)
      } catch (error: unknown) {
        if (!cancelled) {
          setChatError(getApiErrorMessage(error, "Не вдалося завантажити повідомлення."))
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false)
      }
    }

    void Promise.resolve().then(loadConversation)
    return () => {
      cancelled = true
    }
  }, [matchId, markRead])

  useEffect(() => {
    const token = user?.token
    if (!token) return

    let disposed = false
    const connection = new HubConnectionBuilder()
      .withUrl(getChatHubUrl(), { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build()

    connectionRef.current = connection
    connection.onreconnecting(() => setConnectionStatus("connecting"))
    connection.onreconnected(async () => {
      setConnectionStatus("connected")
      const currentMatchId = selectedMatchIdRef.current
      if (currentMatchId) {
        try {
          await connection.invoke("JoinMatch", currentMatchId)
        } catch (error: unknown) {
          setChatError(getApiErrorMessage(error, "Не вдалося відновити підключення до чату."))
        }
      }
    })
    connection.onclose(() => {
      if (!disposed) setConnectionStatus("disconnected")
    })

    connection.on("MessageReceived", (event: ChatMessageEvent) => {
      if (event.matchId !== selectedMatchIdRef.current) {
        setMatches((current) => sortByRecentActivity(current.map((match) => {
          if (match.id !== event.matchId) return match
          const isMine = event.senderProfileId !== match.partner.profileId
          return {
            ...match,
            lastMessage: { text: event.text, sentAt: event.sentAt, isMine },
            unreadCount: isMine ? match.unreadCount : match.unreadCount + 1,
          }
        })))
        return
      }

      const isMine = event.senderProfileId !== partnerProfileIdRef.current
      const message: ChatMessage = {
        ...event,
        isMine,
        myReaction: null,
        partnerReaction: null,
      }
      setMessages((current) => current.some((item) => item.id === event.id)
        ? current
        : [...current, message].sort((left, right) => left.sequence - right.sequence))
      setMatches((current) => sortByRecentActivity(current.map((match) => (
        match.id === event.matchId
          ? { ...match, lastMessage: { text: event.text, sentAt: event.sentAt, isMine }, unreadCount: 0 }
          : match
      ))))
      if (!isMine) {
        scrollToBottomRef.current = true
        void markRead(event.matchId)
      }
    })

    connection.on("MessagesRead", (event: ChatReadEvent) => {
      if (event.matchId === selectedMatchIdRef.current
        && event.readerProfileId === partnerProfileIdRef.current) {
        setPartnerLastReadAt(event.readAt)
      }
    })

    connection.on("ReactionChanged", (event: ChatReactionEvent) => {
      if (event.matchId !== selectedMatchIdRef.current) return
      setMessages((current) => current.map((message) => {
        if (message.id !== event.messageId) return message
        const isPartner = event.profileId === partnerProfileIdRef.current
        return isPartner
          ? { ...message, partnerReaction: event.type }
          : { ...message, myReaction: event.type }
      }))
    })

    async function startConnection() {
      try {
        await connection.start()
        if (disposed) return
        setConnectionStatus("connected")
        const currentMatchId = selectedMatchIdRef.current
        if (currentMatchId) await connection.invoke("JoinMatch", currentMatchId)
      } catch (error: unknown) {
        if (!disposed) {
          setConnectionStatus("disconnected")
          setChatError(getApiErrorMessage(error, "Не вдалося підключитися до чату в реальному часі."))
        }
      }
    }

    void startConnection()
    return () => {
      disposed = true
      connectionRef.current = null
      void connection.stop()
    }
  }, [markRead, user?.token])

  useEffect(() => {
    const connection = connectionRef.current
    if (connection?.state === "Connected" && matchId) {
      void connection.invoke("JoinMatch", matchId).catch((error: unknown) => {
        setChatError(getApiErrorMessage(error, "Не вдалося підключитися до цього чату."))
      })
    }
  }, [matchId])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const previous = previousScrollRef.current
    if (previous) {
      viewport.scrollTop = viewport.scrollHeight - previous.height + previous.top
      previousScrollRef.current = null
    } else if (scrollToBottomRef.current) {
      viewport.scrollTop = viewport.scrollHeight
      scrollToBottomRef.current = false
    }
  }, [messages])

  async function loadOlderMessages() {
    if (!matchId || !hasOlderMessages || isLoadingOlder || visibleMessages.length === 0) return
    const viewport = viewportRef.current
    if (!viewport) return

    setIsLoadingOlder(true)
    setChatError(null)
    try {
      const page = await getMessages(matchId, visibleMessages[0].sequence)
      previousScrollRef.current = { height: viewport.scrollHeight, top: viewport.scrollTop }
      const olderMessages = [...page.items].reverse()
      setMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id))
        return [...olderMessages.filter((message) => !existingIds.has(message.id)), ...current]
      })
      setHasOlderMessages(page.items.length === PAGE_SIZE)
    } catch (error: unknown) {
      setChatError(getApiErrorMessage(error, "Не вдалося завантажити попередні повідомлення."))
    } finally {
      setIsLoadingOlder(false)
    }
  }

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = messageText.trim()
    if (!matchId || !text || isSending) return

    setIsSending(true)
    setChatError(null)
    try {
      const message = await sendMessage(matchId, text)
      setMessages((current) => current.some((item) => item.id === message.id)
        ? current
        : [...current, message].sort((left, right) => left.sequence - right.sequence))
      setMessageText("")
      scrollToBottomRef.current = true
      setMatches((current) => sortByRecentActivity(current.map((match) => (
        match.id === matchId
          ? { ...match, lastMessage: { text: message.text, sentAt: message.sentAt, isMine: true } }
          : match
      ))))
    } catch (error: unknown) {
      setChatError(getApiErrorMessage(error, "Не вдалося надіслати повідомлення."))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <aside className={`${matchId ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-border/80 bg-card/50 md:w-80`}>
        <div className="border-b border-border/70 px-5 py-4">
          <h1 className="text-xl font-semibold">Повідомлення</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ваші розмови та нові знайомства</p>
        </div>
        {matchesError && (
          <div role="alert" className="flex items-center justify-between gap-2 px-5 py-3 text-sm text-destructive">
            <span>{matchesError}</span>
            <Button variant="outline" size="sm" onClick={() => void refreshMatches()}>Повторити</Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isMatchesLoading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Завантаження чатів...
            </div>
          ) : matches.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Поки немає мэтчів. Коли з кимось співпадуть симпатії, тут з’явиться чат.</p>
          ) : matches.map((match) => (
            <Link
              key={match.id}
              to={`/messenger/${match.id}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/70 ${match.id === matchId ? "bg-muted" : ""}`}
            >
              <Avatar className="size-12 shrink-0 rounded-xl">
                <AvatarImage src={match.partner.mainPhotoUrl ?? undefined} alt={match.partner.displayName} />
                <AvatarFallback className="rounded-xl">{initials(match.partner.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{match.partner.displayName}</span>
                  {match.lastMessage && <span className="shrink-0 text-[11px] text-muted-foreground">{formatConversationTime(match.lastMessage.sentAt)}</span>}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {match.lastMessage
                      ? `${match.lastMessage.isMine ? "Ви: " : ""}${match.lastMessage.text}`
                      : "Почніть розмову"}
                  </span>
                  {match.unreadCount > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {match.unreadCount > 99 ? "99+" : match.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <section className={`${matchId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
        {selectedMatch ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-border/70 px-4 py-3 md:px-6">
              <Button render={<Link to="/messenger" />} variant="ghost" size="icon" className="md:hidden" aria-label="До списку чатів">
                <ArrowLeft />
              </Button>
              <Avatar className="size-10 rounded-xl">
                <AvatarImage src={selectedMatch.partner.mainPhotoUrl ?? undefined} alt={selectedMatch.partner.displayName} />
                <AvatarFallback className="rounded-xl">{initials(selectedMatch.partner.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{selectedMatch.partner.displayName}</h2>
                <p className="text-xs text-muted-foreground">
                  {!user?.token || connectionStatus === "disconnected" ? "Немає live-підключення" : connectionStatus === "connected" ? "Підключено" : "Підключення..."}
                </p>
              </div>
            </header>

            {chatError && <p role="alert" className="border-b border-destructive/20 bg-destructive/5 px-5 py-2 text-sm text-destructive">{chatError}</p>}

            <ScrollArea viewportRef={viewportRef} className="min-h-0 flex-1 px-4 md:px-8">
              <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-3 py-5">
                {loadedMatchId === matchId && hasOlderMessages && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" disabled={isLoadingOlder} onClick={() => void loadOlderMessages()}>
                      {isLoadingOlder && <LoaderCircle className="animate-spin" />}
                      Завантажити попередні
                    </Button>
                  </div>
                )}
                {loadedMatchId !== matchId || isLoadingMessages ? (
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" /> Завантаження повідомлень...
                  </div>
                ) : visibleMessages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    Це початок вашої розмови. Напишіть перше повідомлення!
                  </div>
                ) : visibleMessages.map((message) => {
                  const read = message.isMine && partnerLastReadAt !== null
                    && new Date(message.sentAt).getTime() <= new Date(partnerLastReadAt).getTime()
                  const reactions = [message.myReaction, message.partnerReaction].filter((value): value is string => Boolean(value))

                  return (
                    <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[min(78%,34rem)] rounded-2xl px-4 py-2.5 shadow-sm ${message.isMine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"}`}>
                        <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {reactions.length > 0 && <span aria-label="Реакції">{reactions.map(reactionEmoji).join(" ")}</span>}
                          <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
                          {message.isMine && (read ? <CheckCheck className="size-3.5" aria-label="Прочитано" /> : <Check className="size-3.5" aria-label="Надіслано" />)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <form onSubmit={(event) => void handleSendMessage(event)} className="mx-auto flex w-full max-w-4xl shrink-0 items-center gap-2 border-t border-border/70 p-3 md:px-6 md:py-4">
              <Input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Напишіть повідомлення..."
                aria-label="Повідомлення"
                maxLength={2000}
                disabled={isSending}
                className="h-11 flex-1 rounded-full border-border bg-card px-4"
              />
              <Button type="submit" size="icon" className="size-11 rounded-full" disabled={!messageText.trim() || isSending} aria-label="Надіслати повідомлення">
                {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
              </Button>
            </form>
          </>
        ) : matchId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-muted-foreground">{isMatchesLoading ? "Завантаження чату..." : "Цей чат не знайдено серед ваших мэтчів."}</p>
            <Button render={<Link to="/messenger" />} variant="outline">До списку чатів</Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <h2 className="text-lg font-semibold">Оберіть розмову</h2>
            <p className="text-sm text-muted-foreground">Ваші чати з мэтчами з’являться у списку ліворуч.</p>
          </div>
        )}
      </section>
    </div>
  )
}
