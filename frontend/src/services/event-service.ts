import { api } from "@/services/api"
import type {
  CreateEventRequest,
  EventCard,
  EventDetails,
  EventFilters,
  EventChat,
  EventChatMessage,
  EventChatMessagePage,
  EventJoinRequest,
  EventParticipant,
  EventCategory,
  EventsPage,
} from "@/types/event.types"

interface LookupsResponse {
  eventCategories: EventCategory[]
}

export async function getEventCategories(): Promise<EventCategory[]> {
  const response = await api.get<LookupsResponse>("/lookups")
  return response.data.eventCategories
}

export async function getEvents(filters: EventFilters, page = 1, limit = 12): Promise<EventsPage> {
  const response = await api.get<EventsPage>("/events", {
    params: {
      search: filters.search || undefined,
      city: filters.city || undefined,
      categoryId: filters.categoryId || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page,
      limit,
    },
  })
  return response.data
}

export async function getMyEvents(): Promise<EventCard[]> {
  const response = await api.get<EventCard[]>("/events/mine")
  return response.data
}

export async function getMyEventChats(): Promise<EventChat[]> {
  const response = await api.get<EventChat[]>("/events/mine")
  return response.data.filter((event) => event.myStatus === "Approved")
}

export async function getEventMessages(
  eventId: string,
  before?: number,
  limit = 30,
): Promise<EventChatMessagePage> {
  const response = await api.get<EventChatMessagePage>(`/events/${eventId}/messages`, {
    params: { before, limit },
  })
  return response.data
}

export async function sendEventMessage(eventId: string, text: string): Promise<EventChatMessage> {
  const response = await api.post<EventChatMessage>(`/events/${eventId}/messages`, { text })
  return response.data
}

export async function markEventMessagesRead(eventId: string): Promise<void> {
  await api.post(`/events/${eventId}/messages/read`)
}

export async function getEvent(id: string): Promise<EventDetails> {
  const response = await api.get<EventDetails>(`/events/${id}`)
  return response.data
}

export async function createEvent(request: CreateEventRequest): Promise<EventDetails> {
  const response = await api.post<EventDetails>("/events", request)
  return response.data
}

export async function joinEvent(id: string): Promise<void> {
  await api.post(`/events/${id}/join`)
}

export async function leaveEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}/join`)
}

export async function getEventJoinRequests(id: string): Promise<EventJoinRequest[]> {
  const response = await api.get<EventJoinRequest[]>(`/events/${id}/requests`)
  return response.data
}

export async function getEventParticipants(id: string): Promise<EventParticipant[]> {
  const response = await api.get<EventParticipant[]>(`/events/${id}/participants`)
  return response.data
}

export async function approveEventJoinRequest(eventId: string, profileId: string): Promise<void> {
  await api.post(`/events/${eventId}/requests/${profileId}/approve`)
}

export async function rejectEventJoinRequest(eventId: string, profileId: string): Promise<void> {
  await api.post(`/events/${eventId}/requests/${profileId}/reject`)
}
