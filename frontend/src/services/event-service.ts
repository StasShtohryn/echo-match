import { api } from "@/services/api"
import type {
  CreateEventRequest,
  EventDetails,
  EventFilters,
  EventJoinRequest,
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

export async function approveEventJoinRequest(eventId: string, profileId: string): Promise<void> {
  await api.post(`/events/${eventId}/requests/${profileId}/approve`)
}

export async function rejectEventJoinRequest(eventId: string, profileId: string): Promise<void> {
  await api.post(`/events/${eventId}/requests/${profileId}/reject`)
}
