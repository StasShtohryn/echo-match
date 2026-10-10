import { api } from "@/services/api"

export type ReactionType = "Heart" | "Laugh" | "Wow" | "Sad" | "Like" | "Fire"

export interface ChatMessage {
  id: string
  sequence: number
  senderProfileId: string
  isMine: boolean
  text: string
  sentAt: string
  myReaction: ReactionType | number | null
  partnerReaction: ReactionType | number | null
}

export interface MessagePage {
  items: ChatMessage[]
  partnerLastReadAt: string | null
}

export interface ChatMessageEvent {
  matchId: string
  id: string
  sequence: number
  senderProfileId: string
  text: string
  sentAt: string
}

export interface ChatReadEvent {
  matchId: string
  readerProfileId: string
  readAt: string
}

export interface ChatTypingEvent {
  matchId: string
  profileId: string
}

export interface ChatReactionEvent {
  matchId: string
  messageId: string
  profileId: string
  type: ReactionType | number | null
}

export async function getMessages(
  matchId: string,
  before?: number,
  limit = 30,
): Promise<MessagePage> {
  const response = await api.get<MessagePage>(`/matches/${matchId}/messages`, {
    params: { before, limit },
  })
  return response.data
}

export async function sendMessage(matchId: string, text: string): Promise<ChatMessage> {
  const response = await api.post<ChatMessage>(`/matches/${matchId}/messages`, { text })
  return response.data
}

export async function markMessagesRead(matchId: string): Promise<void> {
  await api.post(`/matches/${matchId}/messages/read`)
}

export async function setMessageReaction(
  matchId: string,
  messageId: string,
  type: ReactionType,
): Promise<void> {
  await api.put(`/matches/${matchId}/messages/${messageId}/reaction`, { type })
}

export async function removeMessageReaction(matchId: string, messageId: string): Promise<void> {
  await api.delete(`/matches/${matchId}/messages/${messageId}/reaction`)
}

export function getChatHubUrl(): string {
  const baseUrl = (api.defaults.baseURL || window.location.origin)
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "")

  return `${baseUrl}/hubs/chat`
}
