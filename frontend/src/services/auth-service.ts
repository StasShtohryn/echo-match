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

export interface MyProfile {
  id: string
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
  showMe: string | null
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
  isPrivate: boolean
  isFaceVerified: boolean
  createdAt?: boolean
  photos: ProfilePhoto[]
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
