import { api } from "./api"

export interface AuthResponse {
  userId: string
  email: string
  accessToken: string
}

export interface CreateProfileRequest {
  displayName: string
  dateOfBirth: string
  gender: string
}

export interface ProfilePhoto {
  id: string
  url: string
  isMain: boolean
  order: number
}

export interface LookupItem {
  id: number
  code: string
  name: string
}

export interface PromptAnswer {
  promptId: number
  code: string
  question: string
  answer: string
}

export interface DiscoveryPreferences {
  showMe: string
  minAge: number
  maxAge: number
  maxDistanceKm: number | null
}

export interface FaceVerificationSession {
  sessionId: string
}

export interface FaceVerificationResult {
  status: "verified"
  livenessConfidence: number
  faceSimilarity: number
}

export interface MyProfile {
  id: string
  createdAt: string
  displayName: string
  dateOfBirth: string
  age: number
  gender: string
  zodiac: string
  orientation: string | null
  bio: string | null
  occupation: string | null
  company: string | null
  school: string | null
  heightCm: number | null
  lookingFor: string | null
  preferences: DiscoveryPreferences | null
  familyPlans: string | null
  communication: string | null
  loveLanguage: string | null
  pets: string | null
  drinking: string | null
  smoking: string | null
  workout: string | null
  instagramHandle: string | null
  spotifyHandle: string | null
  isPrivate: boolean
  isFaceVerified: boolean
  isDiscoverable: boolean
  photos: ProfilePhoto[]
  interests: LookupItem[]
  languages: LookupItem[]
  promptAnswers: PromptAnswer[]
}

export interface UpdateProfileRequest {
  displayName: string
  gender: string
  orientation: string | null
  bio: string | null
  occupation: string | null
  company: string | null
  school: string | null
  heightCm: number | null
  lookingFor: string | null
  familyPlans: string | null
  communication: string | null
  loveLanguage: string | null
  pets: string | null
  drinking: string | null
  smoking: string | null
  workout: string | null
  instagramHandle: string | null
  spotifyHandle: string | null
}

export interface UpdatePreferencesRequest {
  showMe: string
  minAge: number
  maxAge: number
  maxDistanceKm: number | null
}

export interface PromptAnswerInput {
  promptId: number
  answer: string
}

export interface Lookups {
  interests: LookupItem[]
  languages: LookupItem[]
  prompts: LookupItem[]
  options: Record<string, string[]>
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  })
  return response.data
}

export async function registerWithPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", {
    email,
    password,
  })
  return response.data
}

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/google", { idToken })
  return response.data
}

export async function getMyProfile(): Promise<MyProfile> {
  const response = await api.get<MyProfile>("/profiles/me")
  return response.data
}

export async function getLookups(): Promise<Lookups> {
  const response = await api.get<Lookups>("/lookups")
  return response.data
}

export async function updateMyProfile(
  profile: UpdateProfileRequest,
): Promise<MyProfile> {
  const response = await api.put<MyProfile>("/profiles/me", profile)
  return response.data
}

export async function updateMyInterests(interestIds: number[]): Promise<LookupItem[]> {
  const response = await api.put<LookupItem[]>("/profiles/me/interests", { interestIds })
  return response.data
}

export async function updateMyLanguages(languageIds: number[]): Promise<LookupItem[]> {
  const response = await api.put<LookupItem[]>("/profiles/me/languages", { languageIds })
  return response.data
}

export async function updateMyPrompts(answers: PromptAnswerInput[]): Promise<PromptAnswer[]> {
  const response = await api.put<PromptAnswer[]>("/profiles/me/prompts", { answers })
  return response.data
}

export async function updateMyPreferences(
  preferences: UpdatePreferencesRequest,
): Promise<DiscoveryPreferences> {
  const response = await api.put<DiscoveryPreferences>("/profiles/me/preferences", preferences)
  return response.data
}

export async function updateMyLocation(latitude: number, longitude: number): Promise<void> {
  await api.put("/profiles/me/location", { latitude, longitude })
}

export async function updateMyVisibility(isPrivate: boolean): Promise<void> {
  await api.patch("/profiles/me/visibility", { isPrivate })
}

export async function deleteProfilePhoto(photoId: string): Promise<void> {
  await api.delete(`/profiles/me/photos/${photoId}`)
}

export async function setMainProfilePhoto(photoId: string): Promise<void> {
  await api.put(`/profiles/me/photos/${photoId}/main`)
}

export async function createProfile(
  profile: CreateProfileRequest,
): Promise<MyProfile> {
  const response = await api.post<MyProfile>("/profiles", profile)
  return response.data
}

export async function uploadProfilePhoto(file: File): Promise<ProfilePhoto> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post<ProfilePhoto>("/profiles/me/photos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function createFaceVerificationSession(): Promise<FaceVerificationSession> {
  const response = await api.post<FaceVerificationSession>(
    "/profiles/me/face-verification/session",
  )
  return response.data
}

export async function completeFaceVerification(
  sessionId: string,
): Promise<FaceVerificationResult> {
  const response = await api.post<FaceVerificationResult>(
    "/profiles/me/face-verification/complete",
    { sessionId },
  )
  return response.data
}
