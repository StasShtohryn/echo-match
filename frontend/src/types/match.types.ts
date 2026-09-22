export interface MatchPartner {
  profileId: string
  displayName: string
  age: number
  mainPhotoUrl: string | null
}

export interface Match {
  id: string
  createdAt: string
  isNew: boolean
  partner: MatchPartner
}