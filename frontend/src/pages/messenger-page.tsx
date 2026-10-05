import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr"
import { ArrowLeft, Camera, Check, CheckCheck, FileText, ImageIcon, LoaderCircle, Paperclip, Send } from "lucide-react"
import { Link, useParams } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAuthStore } from "@/store/useAuthStore"
import type { Match } from "@/types/match.types"
import { getMatches } from "@/services/match-service"
import {
  getChatHubUrl,
  getMessages,
  markMessagesRead,
  removeMessageReaction,
  sendMessage,
  setMessageReaction,
  type ChatMessage,
  type ChatMessageEvent,
  type ChatReadEvent,
  type ChatReactionEvent,
  type ChatTypingEvent,
  type ReactionType,
} from "@/services/message-service"

const PAGE_SIZE = 30
const REACTION_OPTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "Heart", emoji: "❤️", label: "Сердце" },
  { type: "Laugh", emoji: "😂", label: "Смех" },
  { type: "Wow", emoji: "😮", label: "Удивление" },
  { type: "Sad", emoji: "😢", label: "Грусть" },
  { type: "Like", emoji: "👍", label: "Нравится" },
  { type: "Fire", emoji: "🔥", label: "Огонь" },
]

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

function normalizeReaction(reaction: ReactionType | number | null): ReactionType | null | undefined {
  if (reaction === null || typeof reaction === "string") return reaction
  return REACTION_OPTIONS[reaction]?.type
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
  const [typingMatchId, setTypingMatchId] = useState<string | null>(null)
  const [isTypingVisible, setIsTypingVisible] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [hasOlderMessages, setHasOlderMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const connectionRef = useRef<HubConnection | null>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const selectedMatchIdRef = useRef(matchId)
  const partnerProfileIdRef = useRef<string | null>(null)
  const scrollToBottomRef = useRef(false)
  const previousScrollRef = useRef<{ height: number; top: number } | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingExitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSentAtRef = useRef(0)


  // Ref для автоматичного скролу вниз
  const viewportRef = useRef<HTMLDivElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    // Даємо браузеру завершити рендер списку повідомлень у DOM
    requestAnimationFrame(() => {
      const viewport = viewportRef.current
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior,
        })
      }
    })
  }, [])

  // Скролимо, коли повідомлення реально завантажені і відображаються
  useEffect(() => {
    if (loadedMatchId === matchId && !isLoadingMessages && messages.length > 0) {
      scrollToBottom("auto")
    }
  }, [messages, loadedMatchId, matchId, isLoadingMessages, scrollToBottom])

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === matchId) ?? null,
    [matches, matchId],
  )
  const visibleMessages = loadedMatchId === matchId ? messages : []

  const notifyTyping = useCallback((text: string) => {
    if (!text.trim() || !matchId) return

    const now = Date.now()
    const connection = connectionRef.current
    if (now - lastTypingSentAtRef.current < 1000 || connection?.state !== "Connected") return

    lastTypingSentAtRef.current = now
    void connection.invoke("Typing", matchId).catch((error: unknown) => {
      setChatError(getApiErrorMessage(error, "Не вдалося надіслати статус набору тексту."))
    })
  }, [matchId])

  useEffect(() => {
    selectedMatchIdRef.current = matchId
    partnerProfileIdRef.current = selectedMatch?.partner.profileId ?? null
  }, [matchId, selectedMatch?.partner.profileId])


  useEffect(() => {
    if (loadedMatchId === matchId && !isLoadingMessages) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      })
    }
  }, [messages, loadedMatchId, matchId, isLoadingMessages])

  useEffect(() => {
    if (!matchId) return

    function handleGlobalKeyDown(event: KeyboardEvent) {
      const input = messageInputRef.current
      if (
        !input
        || isSending
        || event.defaultPrevented
        || event.isComposing
        || event.key.length !== 1
        || event.ctrlKey
        || event.metaKey
        || event.altKey
        || (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"))
      ) return

      event.preventDefault()
      const start = input.selectionStart ?? input.value.length
      const end = input.selectionEnd ?? start
      const nextText = input.value.slice(0, start) + event.key + input.value.slice(end)
      if (nextText.length <= input.maxLength) {
        setMessageText(nextText)
        notifyTyping(nextText)
        requestAnimationFrame(() => {
          input.focus()
          input.setSelectionRange(start + event.key.length, start + event.key.length)
        })
      } else {
        input.focus()
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [isSending, matchId, notifyTyping])

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
        const chronological = [...page.items].reverse().map((message) => {
          const myReaction = normalizeReaction(message.myReaction)
          const partnerReaction = normalizeReaction(message.partnerReaction)
          return {
            ...message,
            myReaction: myReaction ?? null,
            partnerReaction: partnerReaction ?? null,
          }
        })
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
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingExitTimeoutRef.current) clearTimeout(typingExitTimeoutRef.current)
      setIsTypingVisible(false)
      typingExitTimeoutRef.current = setTimeout(() => {
        setTypingMatchId(null)
        typingExitTimeoutRef.current = null
      }, 300)
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

    connection.on("PartnerTyping", (event: ChatTypingEvent) => {
      if (event.matchId !== selectedMatchIdRef.current
        || event.profileId !== partnerProfileIdRef.current) return

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingExitTimeoutRef.current) clearTimeout(typingExitTimeoutRef.current)
      setTypingMatchId(event.matchId)
      setIsTypingVisible(true)
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedMatchIdRef.current === event.matchId) {
          setIsTypingVisible(false)
          typingExitTimeoutRef.current = setTimeout(() => {
            setTypingMatchId(null)
            typingExitTimeoutRef.current = null
          }, 300)
        }
        typingTimeoutRef.current = null
      }, 2200)
    })

    connection.on("ReactionChanged", (event: ChatReactionEvent) => {
      if (event.matchId !== selectedMatchIdRef.current) return
      const type = normalizeReaction(event.type)
      if (type === undefined) {
        console.error("SignalR sent an unknown reaction value:", event.type)
        return
      }
      setMessages((current) => current.map((message) => {
        if (message.id !== event.messageId) return message
        const isPartner = event.profileId === partnerProfileIdRef.current
        return isPartner
          ? { ...message, partnerReaction: type }
          : { ...message, myReaction: type }
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
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingExitTimeoutRef.current) clearTimeout(typingExitTimeoutRef.current)
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

  function handleMessageInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.currentTarget.value
    setMessageText(text)
    notifyTyping(text)
  }

  async function handleReaction(message: ChatMessage, reaction: ReactionType) {
    if (!matchId) return
    const nextReaction = message.myReaction === reaction ? null : reaction
    try {
      if (nextReaction) {
        await setMessageReaction(matchId, message.id, nextReaction)
      } else {
        await removeMessageReaction(matchId, message.id)
      }
      setMessages((current) => current.map((item) => (
        item.id === message.id ? { ...item, myReaction: nextReaction } : item
      )))
    } catch (error: unknown) {
      setChatError(getApiErrorMessage(error, "Не вдалося змінити реакцію."))
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
              <Button nativeButton={false} render={<Link to="/messenger" />} variant="ghost" size="icon" className="md:hidden" aria-label="До списку чатів">
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
                  const myReaction = normalizeReaction(message.myReaction) ?? null
                  const partnerReaction = normalizeReaction(message.partnerReaction) ?? null
                  const reactions = [myReaction, partnerReaction].filter((value): value is ReactionType => value !== null)

                  return (
                    <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`relative max-w-[min(78%,34rem)] ${reactions.length > 0 ? "mb-3" : ""}`}>
                        <ContextMenu>
                          <ContextMenuTrigger className="block w-fit max-w-full cursor-context-menu">
                            <Bubble
                              align={message.isMine ? "end" : "start"}
                              variant={message.isMine ? "default" : "muted"}
                              className="max-w-full"
                            >
                              <BubbleContent className={`rounded-2xl px-3 py-1.5 ${message.isMine ? "rounded-br-xs" : "rounded-bl-xs border-border bg-card text-card-foreground!"}`}>
                                <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-0.5">
                                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-all text-[14px] leading-snug">{message.text}</p>
                                  <div className={`ml-auto inline-flex shrink-0 select-none items-center gap-1 self-end text-[10px] tabular-nums ${message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
                                  {message.isMine && (read ? <CheckCheck className="size-3.5" aria-label="Прочитано" /> : <Check className="size-3.5" aria-label="Надіслано" />)}
                                  </div>
                                </div>
                              </BubbleContent>
                            </Bubble>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuGroup>
                              <ContextMenuLabel>Поставити реакцію</ContextMenuLabel>
                              <div className="grid grid-cols-6 gap-0.5 px-1 pb-1">
                                {REACTION_OPTIONS.map(({ type, emoji, label }) => (
                                  <ContextMenuItem
                                    key={type}
                                    aria-label={myReaction === type ? `Убрать реакцию: ${label}` : `Поставить реакцию: ${label}`}
                                    title={label}
                                    className={`size-9 justify-center p-0 text-lg ${myReaction === type ? "bg-accent" : ""}`}
                                    onClick={() => void handleReaction(message, type)}
                                  >
                                    {emoji}
                                  </ContextMenuItem>
                                ))}
                              </div>
                            </ContextMenuGroup>
                          </ContextMenuContent>
                        </ContextMenu>
                        {reactions.length > 0 && (
                          <BubbleReactions
                            align={message.isMine ? "end" : "start"}
                            aria-label="Реакції на повідомлення"
                          >
                            {myReaction && (
                              <span key="mine" aria-label={`Ваша реакція: ${reactionEmoji(myReaction)}`} title="Ваша реакція">
                                {reactionEmoji(myReaction)}
                              </span>
                            )}
                            {partnerReaction && (
                              <span key="partner" aria-label={`Реакція співрозмовника: ${reactionEmoji(partnerReaction)}`} title="Реакція співрозмовника">
                                {reactionEmoji(partnerReaction)}
                              </span>
                            )}
                          </BubbleReactions>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} className="h-px w-full" />
              </div>
            </ScrollArea>

            <div className="mx-auto w-full max-w-4xl shrink-0">
              <div className="flex h-7 items-center px-4 md:px-6">
                {selectedMatch && (
                  <Marker
                    role="status"
                    aria-live="polite"
                    aria-hidden={!isTypingVisible || typingMatchId !== matchId}
                    className={`w-fit transform transition-all duration-300 ease-out motion-reduce:transition-none ${isTypingVisible && typingMatchId === matchId ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}
                  >
                    <MarkerContent className="typing-shimmer font-medium">
                      {selectedMatch.partner.displayName} пише...
                    </MarkerContent>
                  </Marker>
                )}
              </div>
              <form onSubmit={(event) => void handleSendMessage(event)} className="flex w-full items-center gap-2 border-t border-border/70 p-3 md:px-6 md:py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 border-border bg-card shadow-sm hover:bg-muted"
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
                <Textarea
                  ref={messageInputRef}
                  value={messageText}
                  onChange={handleMessageInputChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder="Напишіть повідомлення..."
                  aria-label="Повідомлення"
                  maxLength={2000}
                  disabled={isSending}
                  className="min-h-10 max-h-32 flex-1 overflow-y-auto rounded-xl border-border bg-card px-3 py-2 text-sm shadow-sm"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 shadow-sm" disabled={!messageText.trim() || isSending} aria-label="Надіслати повідомлення">
                  {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
                </Button>
              </form>
            </div>
          </>
        ) : matchId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-muted-foreground">{isMatchesLoading ? "Завантаження чату..." : "Цей чат не знайдено серед ваших мэтчів."}</p>
            <Button nativeButton={false} render={<Link to="/messenger" />} variant="outline">До списку чатів</Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <h2 className="text-lg font-semibold">Оберіть розмову</h2>
            <p className="text-sm text-muted-foreground">Ваші чати з метчами з’являться у списку ліворуч.</p>
          </div>
        )}
      </section>
    </div>
  )
}
