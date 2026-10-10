export interface MatchPartner {
  profileId: string
  displayName: string
  age: number
  mainPhotoUrl: string | null
}

export interface MatchLastMessage {
  text: string
  sentAt: string
  isMine: boolean
}

export interface Match {
  id: string
  createdAt: string
  isNew: boolean
  partner: MatchPartner
  lastMessage: MatchLastMessage | null
  unreadCount: number
}