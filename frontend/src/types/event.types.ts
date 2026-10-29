export type EventParticipantStatus = "Pending" | "Approved" | "Rejected"
export type EventJoinPolicy = "Open" | "ApprovalRequired"

export interface EventCategory {
  id: number
  code: string
  name: string
}

export interface EventCard {
  id: string
  title: string
  category: EventCategory
  startsAt: string
  endsAt: string | null
  city: string
  placeName: string | null
  coverUrl: string | null
  joinPolicy: EventJoinPolicy
  capacity: number | null
  participantsCount: number
  myStatus: EventParticipantStatus | null
  isOrganizer: boolean
  organizer: {
    profileId: string
    displayName: string
    mainPhotoUrl: string | null
  }
}

export interface EventDetails extends EventCard {
  description: string | null
  cancelledAt: string | null
  pendingCount: number | null
}

export interface EventsPage {
  items: EventCard[]
  hasMore: boolean
}

export interface EventJoinRequest {
  profileId: string
  displayName: string
  age: number
  mainPhotoUrl: string | null
  isFaceVerified: boolean
  requestedAt: string
}

export interface EventParticipant {
  profileId: string
  displayName: string
  age: number
  mainPhotoUrl: string | null
  isFaceVerified: boolean
  role: "Organizer" | "Member"
}

export interface EventChat {
  id: string
  title: string
  startsAt: string
  city: string
  coverUrl: string | null
  participantsCount: number
  isOrganizer: boolean
  myStatus: EventParticipantStatus | null
  cancelledAt: string | null
  lastMessage: {
    text: string
    sentAt: string
    senderDisplayName: string
    isMine: boolean
  } | null
  unreadCount: number
}

export interface EventChatMessage {
  id: string
  sequence: number
  sender: {
    profileId: string
    displayName: string
    mainPhotoUrl: string | null
  }
  isMine: boolean
  text: string
  sentAt: string
}

export interface EventChatMessagePage {
  items: EventChatMessage[]
  readMarks: EventChatReadMark[]
}

export interface EventChatReadMark {
  profileId: string
  lastReadAt: string | null
}

export interface EventChatMessageReceived {
  eventId: string
  id: string
  sequence: number
  sender: EventChatMessage["sender"]
  text: string
  sentAt: string
}

export interface EventChatMessagesRead {
  eventId: string
  readerProfileId: string
  readAt: string
}

export interface LookupItem {
  id: number
  code: string
  name: string
}

export interface EventFilters {
  search: string
  city: string
  categoryId: string
  from: string
  to: string
}

export interface CreateEventRequest {
  title: string
  description: string | null
  categoryId: number
  startsAt: string
  endsAt: string | null
  city: string
  placeName: string | null
  capacity: number | null
  joinPolicy: EventJoinPolicy
}
