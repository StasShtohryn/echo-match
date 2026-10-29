import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Blobatar } from "@blobatar/react"
import { useGaze } from "@blobatar/react/gaze"
import { love } from "blobatar/expression"
import "blobatar/motion.css"
import "blobatar/gaze.css"
import { createPortal } from "react-dom"
import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr"
import { ArrowLeft, Bell, BellOff, CalendarDays, Camera, Check, CheckCheck, CircleX, Clock3, Eye, FileText, ImageIcon, LoaderCircle, MapPin, MessageCircle, Paperclip, Pin, PinOff, Send, Sparkles, Trash2, Users, X } from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
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
import { getMyProfile, getPublicProfile, type PublicProfile } from "@/services/auth-service"
import { useAuthStore } from "@/store/useAuthStore"
import { useUIStore } from "@/store/useUIStore"
import type { Match } from "@/types/match.types"
import { getMatches } from "@/services/match-service"
import {
  getChatHubUrl,
  getMessages,
  markMessagesRead,
  removeMessageReaction,
  sendMessage,
  suggestMessages,
  setMessageReaction,
  type AiSuggestionKind,
  type MessageTone,
  type ChatMessage,
  type ChatMessageEvent,
  type ChatReadEvent,
  type ChatReactionEvent,
  type ChatTypingEvent,
  type AiSuggestions,
  type ReactionType,
} from "@/services/message-service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getEvent,
  getEventMessages,
  getEventJoinRequests,
  getMyEventChats,
  getEventParticipants,
  approveEventJoinRequest,
  markEventMessagesRead,
  rejectEventJoinRequest,
  sendEventMessage,
} from "@/services/event-service"
import type {
  EventChat,
  EventChatMessage,
  EventChatMessageReceived,
  EventDetails,
  EventJoinRequest,
  EventParticipant,
  EventChatReadMark,
} from "@/types/event.types"

import { SearchIcon } from "lucide-react"
import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PAGE_SIZE = 30
const REACTION_OPTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "Heart", emoji: "❤️", label: "Сердце" },
  { type: "Laugh", emoji: "😂", label: "Смех" },
  { type: "Wow", emoji: "😮", label: "Удивление" },
  { type: "Sad", emoji: "😢", label: "Грусть" },
  { type: "Like", emoji: "👍", label: "Нравится" },
  { type: "Fire", emoji: "🔥", label: "Огонь" },
]

const TONE_OPTIONS: { value: MessageTone; label: string }[] = [
  { value: "Friendly", label: "Дружній" },
  { value: "Playful", label: "Грайливий" },
  { value: "Flirty", label: "Фліртуючий" },
  { value: "Sincere", label: "Щирий" },
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

function sortEventChatsByRecentActivity(events: EventChat[]): EventChat[] {
  return [...events].sort((left, right) => {
    const leftActivity = left.lastMessage?.sentAt ?? left.startsAt
    const rightActivity = right.lastMessage?.sentAt ?? right.startsAt
    return new Date(rightActivity).getTime() - new Date(leftActivity).getTime()
  })
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(new Date(value))
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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const eventIdParam = searchParams.get("eventId") || searchParams.get("event")
  const user = useAuthStore((state) => state.user)
  const { setIsChatOpen } = useUIStore()
  const { ref: gazeRef, lookAt: gazeLookAt } = useGaze({ travel: 6, lookAt: "pointer" })
  const [matches, setMatches] = useState<Match[]>([])
  const [eventChats, setEventChats] = useState<EventChat[]>([])
  const [eventChatsError, setEventChatsError] = useState<string | null>(null)
  const [isEventChatsLoading, setIsEventChatsLoading] = useState(true)
  const [eventConversationId, setEventConversationId] = useState<string | null>(null)
  const isConversationOpen = Boolean(matchId || eventConversationId)

  useEffect(() => {
    setIsChatOpen(isConversationOpen)
    return () => {
      setIsChatOpen(false)
    }
  }, [isConversationOpen, setIsChatOpen])
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [eventDetailsParticipants, setEventDetailsParticipants] = useState<EventParticipant[]>([])
  const [eventDetailsRequests, setEventDetailsRequests] = useState<EventJoinRequest[]>([])
  const [eventDetailsDataError, setEventDetailsDataError] = useState<string | null>(null)
  const [busyEventRequestProfileId, setBusyEventRequestProfileId] = useState<string | null>(null)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [isEventDetailsLoading, setIsEventDetailsLoading] = useState(false)
  const [eventDetailsError, setEventDetailsError] = useState<string | null>(null)
  const [eventMessages, setEventMessages] = useState<EventChatMessage[]>([])
  const [eventReadMarks, setEventReadMarks] = useState<EventChatReadMark[]>([])
  const [eventParticipants, setEventParticipants] = useState<EventParticipant[]>([])
  const [isEventMessagesLoading, setIsEventMessagesLoading] = useState(false)
  const [isLoadingOlderEventMessages, setIsLoadingOlderEventMessages] = useState(false)
  const [hasOlderEventMessages, setHasOlderEventMessages] = useState(false)
  const [eventMessageText, setEventMessageText] = useState("")
  const [isSendingEventMessage, setIsSendingEventMessage] = useState(false)
  const [eventChatError, setEventChatError] = useState<string | null>(null)
  const [eventTypingName, setEventTypingName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("account")
  const [myProfileId, setMyProfileId] = useState<string | null>(null)
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, PublicProfile>>({})
  const [loadingPartnerProfileIds, setLoadingPartnerProfileIds] = useState<Set<string>>(() => new Set())
  const [partnerProfileErrors, setPartnerProfileErrors] = useState<Record<string, string>>({})
  const [pinnedMatchIds, setPinnedMatchIds] = useState<Set<string>>(() => new Set())
  const [mutedMatchIds, setMutedMatchIds] = useState<Set<string>>(() => new Set())
  const [isMatchesLoading, setIsMatchesLoading] = useState(true)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null)
  const [loadedMatchId, setLoadedMatchId] = useState<string | null>(null)
  const [partnerLastReadAt, setPartnerLastReadAt] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [isAiSuggestionsOpen, setIsAiSuggestionsOpen] = useState(false)
  const [selectedTone, setSelectedTone] = useState<MessageTone>("Friendly")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiSuggestionsContext, setAiSuggestionsContext] = useState<{
    matchId: string
    kind: AiSuggestionKind
  } | null>(null)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const bigBlobatarRef = useRef<HTMLDivElement>(null)
  const suggestionsListRef = useRef<HTMLDivElement>(null)
  const { ref: bigGazeRef, lookAt: bigGazeLookAt } = useGaze({ travel: 6, lookAt: "pointer" })
  const isSuggestionsOpen = isAiSuggestionsOpen && loadedMatchId === matchId

  useEffect(() => {
    if (isSuggestionsOpen && bigBlobatarRef.current) {
      gazeLookAt(bigBlobatarRef.current)
      return () => {
        gazeLookAt("pointer")
      }
    } else {
      gazeLookAt("pointer")
    }
  }, [isSuggestionsOpen, gazeLookAt])

  useEffect(() => {
    if (!isSuggestionsOpen || aiSuggestions.length === 0) {
      bigGazeLookAt("pointer")
      return
    }

    function handlePointerMove(event: PointerEvent) {
      const listEl = suggestionsListRef.current
      if (!listEl) return

      const rect = listEl.getBoundingClientRect()
      const targetX = rect.left + Math.min(rect.width * 0.4, 160)
      const minY = rect.top + 10
      const maxY = rect.bottom - 10
      const clampedY = minY <= maxY ? Math.max(minY, Math.min(maxY, event.clientY)) : rect.top + rect.height / 2

      bigGazeLookAt({ x: targetX, y: clampedY })
    }

    if (suggestionsListRef.current) {
      const rect = suggestionsListRef.current.getBoundingClientRect()
      bigGazeLookAt({
        x: rect.left + Math.min(rect.width * 0.4, 160),
        y: rect.top + rect.height / 2,
      })
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      bigGazeLookAt("pointer")
    }
  }, [isSuggestionsOpen, aiSuggestions.length, bigGazeLookAt])

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
  const eventMessageInputRef = useRef<HTMLTextAreaElement>(null)
  const selectedMatchIdRef = useRef(matchId)
  const selectedEventIdRef = useRef(eventConversationId)
  const myProfileIdRef = useRef(myProfileId)
  const aiRequestVersionRef = useRef(0)
  const loadingPartnerProfileIdsRef = useRef(new Set<string>())
  const partnerProfileIdRef = useRef<string | null>(null)
  const scrollToBottomRef = useRef(false)
  const previousScrollRef = useRef<{ height: number; top: number } | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingExitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSentAtRef = useRef(0)

  // Ref для автоматичного скролу вниз
  const viewportRef = useRef<HTMLDivElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventMessagesEndRef = useRef<HTMLDivElement>(null)
  const eventViewportRef = useRef<HTMLDivElement>(null)
  const eventTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastEventTypingSentAtRef = useRef(0)
  const eventMessagesScrollToBottomRef = useRef(false)
  const selectedToneOption = TONE_OPTIONS.find((t) => t.value === selectedTone)

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


  useEffect(() => {
    if (matchId && !isLoadingMessages) {
      // Невелика затримка через requestAnimationFrame гарантує, що DOM готовий до фокусу
      requestAnimationFrame(() => {
        messageInputRef.current?.focus()
      })
    }
  }, [matchId, isLoadingMessages])

  useEffect(() => {
    if (eventConversationId && !isEventMessagesLoading) {
      requestAnimationFrame(() => eventMessageInputRef.current?.focus())
    }
  }, [eventConversationId, isEventMessagesLoading])

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
  const selectedEventChat = useMemo(
    () => eventChats.find((event) => event.id === eventConversationId) ?? null,
    [eventChats, eventConversationId],
  )
  const sortedMatches = useMemo(
    () => [...matches].sort((left, right) => {
      const pinOrder = Number(pinnedMatchIds.has(right.id)) - Number(pinnedMatchIds.has(left.id))
      if (pinOrder !== 0) return pinOrder
      return new Date(right.lastMessage?.sentAt ?? right.createdAt).getTime()
        - new Date(left.lastMessage?.sentAt ?? left.createdAt).getTime()
    }),
    [matches, pinnedMatchIds],
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
    selectedEventIdRef.current = eventConversationId
    myProfileIdRef.current = myProfileId
  }, [eventConversationId, myProfileId])

  useEffect(() => {
    if (matchId && activeTab === "account") setEventConversationId(null)
  }, [activeTab, matchId])

  useEffect(() => {
    if (eventIdParam) {
      selectedEventIdRef.current = eventIdParam
      setEventConversationId(eventIdParam)
      setActiveTab("password")
      setEventTypingName(null)
      setEventChatError(null)
    }
  }, [eventIdParam])


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

  const refreshEventChats = useCallback(async () => {
    setIsEventChatsLoading(true)
    setEventChatsError(null)
    try {
      const [events, profile] = await Promise.all([getMyEventChats(), getMyProfile()])
      myProfileIdRef.current = profile.id
      setMyProfileId(profile.id)
      setEventChats(sortEventChatsByRecentActivity(events))
    } catch (error: unknown) {
      setEventChatsError(getApiErrorMessage(error, "Не вдалося завантажити чати подій."))
    } finally {
      setIsEventChatsLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(refreshEventChats)
  }, [refreshEventChats])

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

  const markEventRead = useCallback(async (id: string) => {
    try {
      await markEventMessagesRead(id)
      setEventChats((current) => current.map((event) => (
        event.id === id ? { ...event, unreadCount: 0 } : event
      )))
    } catch (error: unknown) {
      setEventChatError(getApiErrorMessage(error, "Не вдалося позначити повідомлення події прочитаними."))
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
      setIsAiSuggestionsOpen(false)
      setAiSuggestions([])
      setAiSuggestionsContext(null)
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
    if (!eventConversationId) return

    const activeEventId = eventConversationId
    let cancelled = false

    async function loadEventConversation() {
      setEventMessages([])
      setEventParticipants([])
      setEventChatError(null)
      setIsEventMessagesLoading(true)
      setHasOlderEventMessages(false)
      try {
        const page = await getEventMessages(activeEventId)
        if (cancelled) return
        setEventMessages([...page.items].reverse())
        setEventReadMarks(page.readMarks)
        const participants = await getEventParticipants(activeEventId)
        if (cancelled) return
        setEventParticipants(participants)
        setHasOlderEventMessages(page.items.length === PAGE_SIZE)
        eventMessagesScrollToBottomRef.current = true
        await markEventRead(activeEventId)
      } catch (error: unknown) {
        if (!cancelled) {
          setEventChatError(getApiErrorMessage(error, "Не вдалося завантажити повідомлення події."))
        }
      } finally {
        if (!cancelled) setIsEventMessagesLoading(false)
      }
    }

    void Promise.resolve().then(loadEventConversation)
    return () => {
      cancelled = true
    }
  }, [eventConversationId, markEventRead])

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
      aiRequestVersionRef.current += 1
      setIsAiSuggestionsOpen(false)
      setAiSuggestions([])
      setAiSuggestionsContext(null)
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

    connection.on("EventMessageReceived", (event: EventChatMessageReceived) => {
      const isMine = event.sender.profileId === myProfileIdRef.current
      setEventChats((current) => sortEventChatsByRecentActivity(current.map((item) => (
        item.id === event.eventId
          ? {
            ...item,
            lastMessage: {
              text: event.text,
              sentAt: event.sentAt,
              senderDisplayName: event.sender.displayName,
              isMine,
            },
            unreadCount: selectedEventIdRef.current === event.eventId || isMine
              ? item.unreadCount
              : item.unreadCount + 1,
          }
          : item
      ))))

      if (selectedEventIdRef.current !== event.eventId) return

      const message: EventChatMessage = { ...event, isMine }
      setEventMessages((current) => current.some((item) => item.id === message.id)
        ? current
        : [...current, message].sort((left, right) => left.sequence - right.sequence))
      if (!isMine) {
        eventMessagesScrollToBottomRef.current = true
        void markEventRead(event.eventId)
      }
    })

    connection.on("EventMessagesRead", (event: { eventId: string; readerProfileId: string; readAt: string }) => {
      if (event.eventId !== selectedEventIdRef.current) return
      setEventReadMarks((current) => {
        const existing = current.some((mark) => mark.profileId === event.readerProfileId)
        if (existing) {
          return current.map((mark) => mark.profileId === event.readerProfileId
            ? { ...mark, lastReadAt: event.readAt }
            : mark)
        }
        return [...current, { profileId: event.readerProfileId, lastReadAt: event.readAt }]
      })
    })

    connection.on("EventTyping", (event: { eventId: string; profileId: string; displayName: string }) => {
      if (event.eventId !== selectedEventIdRef.current || event.profileId === myProfileIdRef.current) return
      if (eventTypingTimeoutRef.current) clearTimeout(eventTypingTimeoutRef.current)
      setEventTypingName(event.displayName)
      eventTypingTimeoutRef.current = setTimeout(() => {
        setEventTypingName(null)
        eventTypingTimeoutRef.current = null
      }, 2200)
    })

    connection.on("EventCancelled", (event: { eventId: string }) => {
      setEventChats((current) => current.map((item) => (
        item.id === event.eventId ? { ...item, cancelledAt: new Date().toISOString() } : item
      )))
    })

    connection.on("EventParticipantJoined", (event: { eventId: string; profileId: string }) => {
      if (event.profileId === myProfileIdRef.current) void refreshEventChats()
    })

    connection.on("EventRequestDecided", (event: { eventId: string; status: string }) => {
      if (event.status === "Approved") void refreshEventChats()
    })

    connection.on("EventParticipantLeft", (event: { eventId: string; profileId: string }) => {
      if (event.profileId === myProfileIdRef.current) {
        setEventChats((current) => current.filter((item) => item.id !== event.eventId))
        setEventConversationId((current) => current === event.eventId ? null : current)
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
      if (eventTypingTimeoutRef.current) clearTimeout(eventTypingTimeoutRef.current)
      connectionRef.current = null
      void connection.stop()
    }
  }, [markEventRead, markRead, refreshEventChats, user?.token])

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

  useLayoutEffect(() => {
    const viewport = eventViewportRef.current
    if (viewport && eventMessagesScrollToBottomRef.current) {
      viewport.scrollTop = viewport.scrollHeight
      eventMessagesScrollToBottomRef.current = false
    }
  }, [eventMessages])

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

  async function loadOlderEventMessages() {
    if (!eventConversationId || !hasOlderEventMessages || isLoadingOlderEventMessages || eventMessages.length === 0) return
    const viewport = eventViewportRef.current
    if (!viewport) return

    setIsLoadingOlderEventMessages(true)
    setEventChatError(null)
    const previousHeight = viewport.scrollHeight
    const previousTop = viewport.scrollTop
    try {
      const page = await getEventMessages(eventConversationId, eventMessages[0].sequence)
      const olderMessages = [...page.items].reverse()
      setEventMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id))
        return [...olderMessages.filter((message) => !existingIds.has(message.id)), ...current]
      })
      setHasOlderEventMessages(page.items.length === PAGE_SIZE)
      requestAnimationFrame(() => {
        if (eventViewportRef.current) {
          eventViewportRef.current.scrollTop = eventViewportRef.current.scrollHeight - previousHeight + previousTop
        }
      })
    } catch (error: unknown) {
      setEventChatError(getApiErrorMessage(error, "Не вдалося завантажити попередні повідомлення події."))
    } finally {
      setIsLoadingOlderEventMessages(false)
    }
  }

  async function handleSendEventMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = eventMessageText.trim()
    const activeEvent = selectedEventChat
    if (!activeEvent || !text || isSendingEventMessage || activeEvent.cancelledAt) return

    setIsSendingEventMessage(true)
    setEventChatError(null)
    try {
      const message = await sendEventMessage(activeEvent.id, text)
      setEventMessages((current) => current.some((item) => item.id === message.id)
        ? current
        : [...current, message].sort((left, right) => left.sequence - right.sequence))
      eventMessagesScrollToBottomRef.current = true
      setEventMessageText("")
      setEventChats((current) => sortEventChatsByRecentActivity(current.map((item) => (
        item.id === activeEvent.id
          ? {
            ...item,
            lastMessage: {
              text: message.text,
              sentAt: message.sentAt,
              senderDisplayName: message.sender.displayName,
              isMine: true,
            },
            unreadCount: 0,
          }
          : item
      ))))
    } catch (error: unknown) {
      setEventChatError(getApiErrorMessage(error, "Не вдалося надіслати повідомлення."))
    } finally {
      setIsSendingEventMessage(false)
      requestAnimationFrame(() => eventMessageInputRef.current?.focus())
    }
  }

  function handleEventMessageInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.currentTarget.value
    setEventMessageText(text)
    const connection = connectionRef.current
    const now = Date.now()
    if (!text.trim() || !eventConversationId || now - lastEventTypingSentAtRef.current < 1000
      || connection?.state !== "Connected") return

    lastEventTypingSentAtRef.current = now
    void connection.invoke("TypingInEvent", eventConversationId).catch((error: unknown) => {
      setEventChatError(getApiErrorMessage(error, "Не вдалося надіслати статус набору тексту."))
    })
  }

  function openEventChat(id: string) {
    selectedEventIdRef.current = id
    setEventConversationId(id)
    setActiveTab("password")
    setEventTypingName(null)
    setEventChatError(null)
    if (matchId) navigate("/messenger")
  }

  async function openEventDetails() {
    if (!eventConversationId) return
    setIsEventDetailsOpen(true)
    setIsEventDetailsLoading(true)
    setEventDetailsError(null)
    setEventDetailsDataError(null)
    try {
      const details = await getEvent(eventConversationId)
      setEventDetails(details)
      setEventDetailsParticipants([])
      setEventDetailsRequests([])

      const requests = details.isOrganizer
        ? getEventJoinRequests(eventConversationId)
        : Promise.resolve<EventJoinRequest[]>([])
      const [participantsResult, requestsResult] = await Promise.allSettled([
        getEventParticipants(eventConversationId),
        requests,
      ])

      if (participantsResult.status === "fulfilled") {
        setEventDetailsParticipants(participantsResult.value)
      }
      if (requestsResult.status === "fulfilled") {
        setEventDetailsRequests(requestsResult.value)
      }
      if (participantsResult.status === "rejected" || requestsResult.status === "rejected") {
        setEventDetailsDataError(getApiErrorMessage(
          participantsResult.status === "rejected" ? participantsResult.reason : requestsResult.status === "rejected" ? requestsResult.reason : null,
          "Не вдалося завантажити учасників або заявки.",
        ))
      }
    } catch (error: unknown) {
      setEventDetailsError(getApiErrorMessage(error, "Не вдалося завантажити деталі події."))
    } finally {
      setIsEventDetailsLoading(false)
    }
  }

  async function handleEventRequestDecision(request: EventJoinRequest, action: "approve" | "reject") {
    if (!eventDetails) return
    const eventId = eventDetails.id
    setBusyEventRequestProfileId(request.profileId)
    setEventDetailsDataError(null)
    try {
      if (action === "approve") await approveEventJoinRequest(eventId, request.profileId)
      else await rejectEventJoinRequest(eventId, request.profileId)

      const [details, requests, participants] = await Promise.all([
        getEvent(eventId),
        getEventJoinRequests(eventId),
        getEventParticipants(eventId),
      ])
      setEventDetails(details)
      setEventDetailsRequests(requests)
      setEventDetailsParticipants(participants)
      await refreshEventChats()
    } catch (error: unknown) {
      setEventDetailsDataError(getApiErrorMessage(error, "Не вдалося оновити заявку. Спробуйте ще раз."))
    } finally {
      setBusyEventRequestProfileId(null)
    }
  }

  function closeEventDetails() {
    setIsEventDetailsOpen(false)
    setEventDetails(null)
    setEventDetailsParticipants([])
    setEventDetailsRequests([])
    setEventDetailsDataError(null)
    setEventDetailsError(null)
  }

  function closeEventChat() {
    selectedEventIdRef.current = null
    setEventConversationId(null)
    setActiveTab("password")
    setEventMessages([])
    if (searchParams.get("eventId") || searchParams.get("event")) {
      navigate("/messenger", { replace: true })
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
      setIsAiSuggestionsOpen(false)
      setAiSuggestions([])
      setAiSuggestionsContext(null)
      aiRequestVersionRef.current += 1
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
      requestAnimationFrame(() => {
        messageInputRef.current?.focus()
      })
    }
  }

  async function handleGenerateSuggestions() {
    if (
      !matchId
      || loadedMatchId !== matchId
      || isGeneratingSuggestions
      || isSending
    ) return

    const requestedMatchId = matchId
    const kind: AiSuggestionKind = visibleMessages.length === 0 ? "FirstMessage" : "Reply"
    const requestVersion = aiRequestVersionRef.current
    setIsGeneratingSuggestions(true)
    setChatError(null)
    try {
      const result: AiSuggestions = await suggestMessages(requestedMatchId, kind, selectedTone)
      if (
        selectedMatchIdRef.current !== requestedMatchId
        || aiRequestVersionRef.current !== requestVersion
      ) return
      if (result.suggestions.length === 0) {
        throw new Error("Не вдалося згенерувати варіанти повідомлення.")
      }
      setAiSuggestionsContext({ matchId: requestedMatchId, kind })
      setAiSuggestions(result.suggestions)
    } catch (error: unknown) {
      if (
        selectedMatchIdRef.current === requestedMatchId
        && aiRequestVersionRef.current === requestVersion
      ) {
        setChatError(getApiErrorMessage(error, "Не вдалося згенерувати варіанти повідомлення."))
      }
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  function handleToggleAiSuggestions() {
    setIsAiSuggestionsOpen((current) => !current)
    setChatError(null)
  }

  function handleSelectSuggestion(suggestion: string) {
    setMessageText(suggestion)
    setIsAiSuggestionsOpen(false)
    setAiSuggestions([])
    setAiSuggestionsContext(null)
    requestAnimationFrame(() => messageInputRef.current?.focus())
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

  function togglePinnedMatch(id: string) {
    setPinnedMatchIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleMutedMatch(id: string) {
    setMutedMatchIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function loadPartnerProfile(profileId: string) {
    if (partnerProfiles[profileId] || loadingPartnerProfileIdsRef.current.has(profileId)) return

    loadingPartnerProfileIdsRef.current.add(profileId)
    setLoadingPartnerProfileIds(new Set(loadingPartnerProfileIdsRef.current))
    setPartnerProfileErrors((current) => {
      const next = { ...current }
      delete next[profileId]
      return next
    })

    try {
      const profile = await getPublicProfile(profileId)
      setPartnerProfiles((current) => ({ ...current, [profileId]: profile }))
    } catch (error: unknown) {
      setPartnerProfileErrors((current) => ({
        ...current,
        [profileId]: getApiErrorMessage(error, "Не вдалося завантажити профіль."),
      }))
    } finally {
      loadingPartnerProfileIdsRef.current.delete(profileId)
      setLoadingPartnerProfileIds(new Set(loadingPartnerProfileIdsRef.current))
    }
  }

  function markMatchUnread(id: string) {
    setMatches((current) => current.map((match) => (
      match.id === id ? { ...match, unreadCount: Math.max(1, match.unreadCount) } : match
    )))
  }

  function clearMatchHistory(id: string) {
    setMatches((current) => current.map((match) => (
      match.id === id ? { ...match, lastMessage: null, unreadCount: 0 } : match
    )))
    if (matchId === id) {
      setMessages([])
      setHasOlderMessages(false)
      setPartnerLastReadAt(null)
    }
  }

  function deleteMatch(id: string) {
    setMatches((current) => current.filter((match) => match.id !== id))
    setPinnedMatchIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    setMutedMatchIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    if (matchId === id) navigate("/messenger")
  }

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <aside className={`${matchId || eventConversationId ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-border/80 bg-card/50 md:w-80`}>
        <div className="border-b border-border/70 px-5 py-4">
          <h1 className="text-xl font-semibold">Повідомлення</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ваші розмови та нові знайомства</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <Field className="max-w-sm">
            <InputGroup>
              <InputGroupInput id="inline-start-input" placeholder="Пошук..." />
              <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              if (value === "account") setEventConversationId(null)
            }}
            className="min-h-0 flex-1"
          >
            <TabsList className="w-full">
              <TabsTrigger value="account">Особисті</TabsTrigger>
              <TabsTrigger value="password">Події</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="flex min-h-0 flex-1 flex-col">
              {matchesError && (
                <div role="alert" className="flex items-center justify-between gap-2 px-1 py-3 text-sm text-destructive">
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
                  <p className="p-5 text-sm text-muted-foreground">Поки немає чатів.</p>
                ) : sortedMatches.map((match) => (
                  <ContextMenu key={match.id} onOpenChange={(open) => {
                    if (open) void loadPartnerProfile(match.partner.profileId)
                  }}>
                    <ContextMenuTrigger
                      render={
                        <Link
                          to={`/messenger/${match.id}`}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/70 ${match.id === matchId ? "bg-muted" : ""}`}
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
                      }
                    />
                    <ContextMenuContent className="w-72 bg-popover/55 backdrop-blur-xl">
                      {(() => {
                        const profile = partnerProfiles[match.partner.profileId]
                        const isProfileLoading = loadingPartnerProfileIds.has(match.partner.profileId)
                        const profileError = partnerProfileErrors[match.partner.profileId]
                        const interests = profile?.interests ?? []

                        return (
                          <div className="px-2 py-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-12 rounded-xl">
                                <AvatarImage src={match.partner.mainPhotoUrl ?? undefined} alt={match.partner.displayName} />
                                <AvatarFallback className="rounded-xl">{initials(match.partner.displayName)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {profile?.displayName ?? match.partner.displayName}{(profile?.age ?? match.partner.age) ? `, ${profile?.age ?? match.partner.age}` : ""}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="size-3" /> {profile?.city || "Місто не вказано"}
                                </p>
                              </div>
                            </div>
                            {profile?.bio && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{profile.bio}</p>}
                            <p className="mt-3 text-xs text-muted-foreground">Інтереси</p>
                            {isProfileLoading ? (
                              <p className="mt-1.5 text-xs text-muted-foreground">Завантаження профілю...</p>
                            ) : profileError ? (
                              <p role="alert" className="mt-1.5 text-xs text-destructive">{profileError}</p>
                            ) : interests.length > 0 ? (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {interests.map((interest) => (
                                  <span key={interest.id} className="rounded-full bg-muted px-2 py-1 text-xs">{interest.name}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1.5 text-xs text-muted-foreground">
                                {profile ? "Інтереси не вказані" : "Профіль поки не завантажено"}
                              </p>
                            )}
                          </div>
                        )
                      })()}
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        <ContextMenuItem onClick={() => navigate(`/messenger/${match.id}`)}>
                          <MessageCircle />
                          Перейти до чату
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => markMatchUnread(match.id)}>
                          <Eye />
                          Позначити як непрочитане
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => togglePinnedMatch(match.id)}>
                          {pinnedMatchIds.has(match.id) ? <PinOff /> : <Pin />}
                          {pinnedMatchIds.has(match.id) ? "Відкріпити чат" : "Закріпити чат"}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => toggleMutedMatch(match.id)}>
                          {mutedMatchIds.has(match.id) ? <Bell /> : <BellOff />}
                          {mutedMatchIds.has(match.id) ? "Увімкнути сповіщення" : "Вимкнути сповіщення"}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => clearMatchHistory(match.id)}>
                          <CircleX />
                          Очистити історію
                        </ContextMenuItem>
                        <ContextMenuItem
                          variant="destructive"
                          onClick={() => deleteMatch(match.id)}
                        >
                          <Trash2 />
                          Видалити чат
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="password" className="flex min-h-0 flex-1 flex-col">
              {eventChatsError && (
                <div role="alert" className="flex items-center justify-between gap-2 px-1 py-3 text-sm text-destructive">
                  <span>{eventChatsError}</span>
                  <Button variant="outline" size="sm" onClick={() => void refreshEventChats()}>Повторити</Button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {isEventChatsLoading ? (
                  <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" /> Завантаження подій...
                  </div>
                ) : eventChats.length === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground">
                    Підтверджених чатів подій поки немає. Вони з’являться тут, коли вас приймуть на подію або ви створите власну.
                  </div>
                ) : sortEventChatsByRecentActivity(eventChats).map((event) => (
                  <button
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/70 ${event.id === eventConversationId ? "bg-muted" : ""}`}
                    key={event.id}
                    onClick={() => openEventChat(event.id)}
                    type="button"
                  >
                    <Avatar className="size-12 shrink-0 rounded-xl">
                      <AvatarImage alt={event.title} src={event.coverUrl ?? undefined} />
                      <AvatarFallback className="rounded-xl"><CalendarDays className="size-5" /></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{event.title}</span>
                        {event.lastMessage && (
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatConversationTime(event.lastMessage.sentAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          {event.lastMessage
                            ? `${event.lastMessage.isMine ? "Ви: " : `${event.lastMessage.senderDisplayName}: `}${event.lastMessage.text}`
                            : `${formatEventDate(event.startsAt)} · ${event.city}`}
                        </span>
                        {event.unreadCount > 0 && (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {event.unreadCount > 99 ? "99+" : event.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </aside >

      <section className={`${matchId || eventConversationId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
        {eventConversationId ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-border/70 px-4 py-3 md:px-6">
              <Button
                onClick={closeEventChat}
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="До списку чатів подій"
              >
                <ArrowLeft />
              </Button>
              <button
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => void openEventDetails()}
                type="button"
              >
                <Avatar className="size-10 shrink-0 rounded-xl">
                  <AvatarImage alt={selectedEventChat?.title ?? "Подія"} src={selectedEventChat?.coverUrl ?? undefined} />
                  <AvatarFallback className="rounded-xl"><CalendarDays className="size-5" /></AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{selectedEventChat?.title ?? "Чат події"}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {selectedEventChat
                      ? `${formatEventDate(selectedEventChat.startsAt)} · ${selectedEventChat.city}`
                      : "Завантаження події..."}
                  </span>
                </span>
              </button>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {!user?.token || connectionStatus === "disconnected"
                  ? "Немає live-підключення"
                  : connectionStatus === "connected" ? "Підключено" : "Підключення..."}
              </span>
            </header>
            {selectedEventChat?.cancelledAt && (
              <p className="border-b border-border/70 bg-muted/50 px-5 py-2 text-center text-sm text-muted-foreground">
                Подію скасовано. Чат доступний лише для читання.
              </p>
            )}
            {eventChatError && (
              <p role="alert" className="border-b border-destructive/20 bg-destructive/5 px-5 py-2 text-sm text-destructive">
                {eventChatError}
              </p>
            )}
            <ScrollArea viewportRef={eventViewportRef} className="min-h-0 flex-1 px-4 md:px-8">
              <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-3 py-5">
                {hasOlderEventMessages && (
                  <div className="flex justify-center">
                    <Button
                      disabled={isLoadingOlderEventMessages}
                      onClick={() => void loadOlderEventMessages()}
                      size="sm"
                      variant="outline"
                    >
                      {isLoadingOlderEventMessages && <LoaderCircle className="animate-spin" />}
                      Завантажити попередні
                    </Button>
                  </div>
                )}
                {isEventMessagesLoading ? (
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" /> Завантаження повідомлень...
                  </div>
                ) : eventMessages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    Це початок чату події. Напишіть перше повідомлення учасникам!
                  </div>
                ) : eventMessages.map((message) => {
                  const readCount = eventParticipants.filter((participant) => (
                    participant.profileId !== myProfileId
                    && eventReadMarks.some((mark) => (
                      mark.profileId === participant.profileId
                      && mark.lastReadAt !== null
                      && new Date(mark.lastReadAt).getTime() >= new Date(message.sentAt).getTime()
                    ))
                  )).length
                  const otherParticipantsCount = Math.max((selectedEventChat?.participantsCount ?? 1) - 1, 0)

                  return (
                    <div className={`flex items-end gap-2 ${message.isMine ? "justify-end" : "justify-start"}`} key={message.id}>
                      {!message.isMine && (
                        <Link
                          aria-label={`Відкрити профіль ${message.sender.displayName}`}
                          className="shrink-0"
                          to={`/profile/${message.sender.profileId}`}
                        >
                          <Avatar className="size-11">
                            <AvatarImage alt={message.sender.displayName} src={message.sender.mainPhotoUrl ?? undefined} />
                            <AvatarFallback className="text-xs">{initials(message.sender.displayName)}</AvatarFallback>
                          </Avatar>
                        </Link>
                      )}
                      {message.isMine ? (
                        <div className="max-w-[min(78%,34rem)] rounded-2xl rounded-br-xs bg-primary px-3 py-2 text-primary-foreground">
                          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                            <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm">{message.text}</p>
                            <time className="ml-auto shrink-0 text-[10px] opacity-70" dateTime={message.sentAt}>
                              {formatTime(message.sentAt)}
                            </time>
                          </div>
                          {otherParticipantsCount > 0 && (
                            <div
                              aria-label={readCount > 0
                                ? `Переглянули ${readCount} з ${otherParticipantsCount}`
                                : "Не переглянуто"}
                              className="mt-1 flex items-center justify-end gap-1 text-[10px] text-primary-foreground/75"
                              title={readCount > 0
                                ? `Переглянули ${readCount} з ${otherParticipantsCount}`
                                : "Не переглянуто"}
                            >
                              {readCount > 0
                                ? <><CheckCheck className="size-3" />{readCount}/{otherParticipantsCount}</>
                                : <><Check className="size-3" />Не переглянуто</>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-[min(78%,34rem)] rounded-2xl rounded-bl-xs border border-border bg-card px-3 py-2">
                          <p className="mb-1 text-xs font-semibold text-primary">{message.sender.displayName}</p>
                          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                            <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm">{message.text}</p>
                            <time className="ml-auto shrink-0 text-[10px] text-muted-foreground" dateTime={message.sentAt}>
                              {formatTime(message.sentAt)}
                            </time>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={eventMessagesEndRef} className="h-px w-full" />
              </div>
            </ScrollArea>
            <div className="mx-auto w-full max-w-4xl shrink-0">
              <div className="flex h-7 items-center px-4 md:px-6">
                {eventTypingName && (
                  <span className="text-xs text-muted-foreground" role="status">{eventTypingName} пише...</span>
                )}
              </div>
              <form onSubmit={(event) => void handleSendEventMessage(event)} className="flex w-full items-center gap-2 border-t border-border/70 p-3 md:px-6 md:py-4">
                <Textarea
                  ref={eventMessageInputRef}
                  value={eventMessageText}
                  onChange={handleEventMessageInputChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder={selectedEventChat?.cancelledAt ? "Чат лише для читання" : "Повідомлення учасникам..."}
                  aria-label="Повідомлення в чаті події"
                  maxLength={2000}
                  disabled={!selectedEventChat || !!selectedEventChat.cancelledAt || isSendingEventMessage}
                  className="min-h-10 max-h-32 flex-1 resize-none overflow-y-auto rounded-xl border-border bg-card px-3 py-2 text-sm leading-5 shadow-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0 shadow-sm"
                  disabled={!eventMessageText.trim() || !selectedEventChat || !!selectedEventChat.cancelledAt || isSendingEventMessage}
                  aria-label="Надіслати повідомлення"
                >
                  {isSendingEventMessage ? <LoaderCircle className="animate-spin" /> : <Send />}
                </Button>
              </form>
            </div>
            {isEventDetailsOpen && (
              <div
                className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
                onClick={closeEventDetails}
              >
                <section
                  aria-labelledby="messenger-event-details-title"
                  aria-modal="true"
                  className="no-scrollbar my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                >
                  {isEventDetailsLoading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
                      <LoaderCircle className="size-4 animate-spin" /> Завантажуємо деталі події...
                    </div>
                  ) : eventDetailsError ? (
                    <div className="space-y-4 p-8 text-center">
                      <p className="text-sm text-destructive" role="alert">{eventDetailsError}</p>
                      <Button onClick={closeEventDetails} variant="outline">Закрити</Button>
                    </div>
                  ) : eventDetails ? (
                    <>
                      {eventDetails.coverUrl ? (
                        <img alt="" className="h-52 w-full object-cover" src={eventDetails.coverUrl} />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                          <CalendarDays aria-hidden="true" className="size-14 text-primary/70" />
                        </div>
                      )}
                      <div className="space-y-5 p-6 sm:p-8">
                        <div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {eventDetails.category.name}
                          </span>
                          <h2 className="mt-3 font-heading text-3xl" id="messenger-event-details-title">
                            {eventDetails.title}
                          </h2>
                          <Link
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
                            to={`/profile/${eventDetails.organizer.profileId}`}
                            onClick={closeEventDetails}
                          >
                            <Avatar className="size-8">
                              <AvatarImage alt={eventDetails.organizer.displayName} src={eventDetails.organizer.mainPhotoUrl ?? undefined} />
                              <AvatarFallback className="text-xs">{initials(eventDetails.organizer.displayName)}</AvatarFallback>
                            </Avatar>
                            Організатор: {eventDetails.organizer.displayName}
                          </Link>
                        </div>
                        {eventDetails.description && (
                          <p className="whitespace-pre-wrap text-sm leading-6">{eventDetails.description}</p>
                        )}
                        <div className="grid gap-3 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-primary" />
                            {new Intl.DateTimeFormat("uk-UA", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }).format(new Date(eventDetails.startsAt))}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 className="size-4 text-primary" />
                            {formatTime(eventDetails.startsAt)}
                            {eventDetails.endsAt ? ` — ${formatTime(eventDetails.endsAt)}` : ""}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="size-4 text-primary" />
                            {eventDetails.city}{eventDetails.placeName ? ` · ${eventDetails.placeName}` : ""}
                          </p>
                          <p className="flex items-center gap-2">
                            <Users className="size-4 text-primary" />
                            {eventDetails.participantsCount}
                            {eventDetails.capacity ? ` з ${eventDetails.capacity}` : ""} учасників
                          </p>
                        </div>
                        {eventDetailsDataError && (
                          <p className="text-sm text-destructive" role="alert">{eventDetailsDataError}</p>
                        )}
                        <section aria-labelledby="messenger-event-participants-title" className="space-y-3 border-t border-border pt-5">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-heading text-xl" id="messenger-event-participants-title">Учасники</h3>
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                              {eventDetailsParticipants.length || eventDetails.participantsCount}
                            </span>
                          </div>
                          {eventDetailsParticipants.length === 0 ? (
                            <p className="rounded-2xl bg-muted/50 px-4 py-5 text-center text-sm text-muted-foreground">
                              Учасників поки немає або список недоступний.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {eventDetailsParticipants.map((participant) => (
                                <Link
                                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
                                  key={participant.profileId}
                                  onClick={closeEventDetails}
                                  to={`/profile/${participant.profileId}`}
                                >
                                  <Avatar className="size-10">
                                    <AvatarImage alt={participant.displayName} src={participant.mainPhotoUrl ?? undefined} />
                                    <AvatarFallback className="text-xs">{initials(participant.displayName)}</AvatarFallback>
                                  </Avatar>
                                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                    {participant.displayName}{participant.age ? `, ${participant.age}` : ""}
                                  </span>
                                  {participant.role === "Organizer" && (
                                    <span className="text-xs text-muted-foreground">Організатор</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                        </section>
                        {eventDetails.isOrganizer && (
                          <section aria-labelledby="messenger-event-requests-title" className="space-y-3 border-t border-border pt-5">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-heading text-xl" id="messenger-event-requests-title">Заявки на участь</h3>
                              {eventDetailsRequests.length > 0 && (
                                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                                  {eventDetailsRequests.length}
                                </span>
                              )}
                            </div>
                            {eventDetailsRequests.length === 0 ? (
                              <p className="rounded-2xl bg-muted/50 px-4 py-5 text-center text-sm text-muted-foreground">
                                Нових заявок поки немає.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {eventDetailsRequests.map((request) => (
                                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3" key={request.profileId}>
                                    <Link
                                      className="flex min-w-0 flex-1 items-center gap-3 hover:text-primary"
                                      onClick={closeEventDetails}
                                      to={`/profile/${request.profileId}`}
                                    >
                                      <Avatar className="size-10">
                                        <AvatarImage alt={request.displayName} src={request.mainPhotoUrl ?? undefined} />
                                        <AvatarFallback className="text-xs">{initials(request.displayName)}</AvatarFallback>
                                      </Avatar>
                                      <span className="truncate text-sm font-medium">
                                        {request.displayName}{request.age ? `, ${request.age}` : ""}
                                      </span>
                                    </Link>
                                    <div className="flex gap-2">
                                      <Button
                                        disabled={busyEventRequestProfileId !== null || !!eventDetails.cancelledAt}
                                        onClick={() => void handleEventRequestDecision(request, "approve")}
                                        size="sm"
                                      >
                                        {busyEventRequestProfileId === request.profileId ? <LoaderCircle className="animate-spin" /> : "Прийняти"}
                                      </Button>
                                      <Button
                                        disabled={busyEventRequestProfileId !== null || !!eventDetails.cancelledAt}
                                        onClick={() => void handleEventRequestDecision(request, "reject")}
                                        size="sm"
                                        variant="outline"
                                      >
                                        Відхилити
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </section>
                        )}
                        <div className="flex justify-end border-t border-border pt-4">
                          <Button onClick={closeEventDetails} variant="outline">Закрити</Button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>
              </div>
            )}
          </>
        ) : selectedMatch ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-border/70 px-4 py-3 md:px-6">
              <Button nativeButton={false} render={<Link to="/messenger" />} variant="ghost" size="icon" className="md:hidden" aria-label="До списку чатів">
                <ArrowLeft />
              </Button>

              <Link to={`/profile/${selectedMatch.partner.profileId}`} className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80">
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
              </Link>
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
                    <div
                      key={message.id}
                      className={`flex ${message.isMine ? "justify-end" : "justify-start"} ${activeReactionMessageId === message.id ? "relative z-[45]" : ""}`}
                    >
                      <div className={`relative max-w-[min(78%,34rem)] ${reactions.length > 0 ? "mb-3" : ""}`}>
                        <ContextMenu
                          onOpenChange={(open) => {
                            setActiveReactionMessageId((current) => {
                              if (open) return message.id
                              return current === message.id ? null : current
                            })
                          }}
                        >
                          <ContextMenuTrigger className="block w-fit max-w-full cursor-context-menu">
                            <Bubble
                              align={message.isMine ? "end" : "start"}
                              variant={message.isMine ? "default" : "muted"}
                              className="max-w-full"
                            >
                              <BubbleContent className={`rounded-2xl px-3 py-1.5 ${message.isMine ? "rounded-br-xs" : "rounded-bl-xs border-border bg-card text-card-foreground!"}`}>
                                <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-0.5">
                                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[14px] leading-snug">{message.text}</p>
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
            {activeReactionMessageId && createPortal(
              <button
                type="button"
                aria-label="Закрыть меню реакций"
                className="fixed inset-0 z-40 cursor-default animate-in fade-in-0 duration-200 ease-out bg-black/15 backdrop-blur-[1px]"
                onClick={() => setActiveReactionMessageId(null)}
              />,
              document.body,
            )}

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
              {isSuggestionsOpen && (
                <div className="mx-3 mb-3 flex items-stretch gap-3 md:mx-6">
                  <div className="hidden w-20 shrink-0 items-end sm:flex">
                    <div ref={bigBlobatarRef} className="size-20 rounded-full">
                      <Blobatar
                        ref={bigGazeRef}
                        name="alain00"
                        traits={{ shape: 0.825 }}
                        background="circle"
                        palette={{ bg: "#ffffff" }}
                        hue={40}
                        expression={love}
                        animate="always"
                        size={80}
                        className="rounded-full bg-white shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {visibleMessages.length === 0 ? "Варіанти першого повідомлення" : "Варіанти відповіді"}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Закрити варіанти"
                        onClick={() => {
                          setIsAiSuggestionsOpen(false)
                          setAiSuggestions([])
                          setAiSuggestionsContext(null)
                        }}
                      >
                        <X />
                      </Button>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <div className="w-40">
                        <Select
                          value={selectedTone}
                          onValueChange={(value) => {
                            if (value) setSelectedTone(value as MessageTone)
                          }}
                        >
                          <SelectTrigger className="h-8 w-full rounded-xl border border-border bg-background text-xs">
                            <SelectValue placeholder="Оберіть тон">
                              {selectedToneOption ? selectedToneOption.label : "Оберіть тон"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {TONE_OPTIONS.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                {tone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        className="rounded-xl"
                        disabled={isGeneratingSuggestions || isSending}
                        onClick={() => void handleGenerateSuggestions()}
                      >
                        {isGeneratingSuggestions ? (
                          <>
                            <LoaderCircle className="size-3.5 animate-spin" />
                            Генерація...
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5" />
                            {aiSuggestions.length > 0 ? "Перегенерувати" : "Згенерувати"}
                          </>
                        )}
                      </Button>
                    </div>

                    {aiSuggestions.length > 0 ? (
                      <div ref={suggestionsListRef} className="grid gap-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <button
                            key={`${index}-${suggestion}`}
                            type="button"
                            className="rounded-xl border border-border/70 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => handleSelectSuggestion(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    ) : !isGeneratingSuggestions ? (
                      <p className="py-1 text-xs text-muted-foreground">
                        Оберіть бажаний тон та натисніть «Згенерувати», щоб отримати персоналізовані варіанти.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
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

                {loadedMatchId === matchId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 shrink-0 border-border bg-card shadow-sm hover:bg-muted ${isAiSuggestionsOpen ? "ring-2 ring-primary" : ""}`}
                    aria-label="ІІ-підказки"
                    title="ІІ-підказки"
                    disabled={isSending}
                    onClick={handleToggleAiSuggestions}
                  >
                    <Blobatar
                      ref={gazeRef}
                      name="alain00"
                      traits={{ shape: 0.825 }}
                      background={false}
                      hue={40}
                      expression={love}
                      animate="always"
                      className="size-full p-0.5"
                    />
                  </Button>
                )}

                <Textarea
                  autoFocus
                  ref={messageInputRef}
                  value={messageText}
                  onChange={handleMessageInputChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder="Повідомлення..."
                  aria-label="Повідомлення"
                  maxLength={2000}
                  disabled={isSending}
                  className="min-h-10 max-h-32 flex-1 resize-none overflow-y-auto rounded-xl border-border bg-card px-3 py-2 text-sm leading-5 shadow-sm"
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
    </div >
  )
}
