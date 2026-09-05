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

export async function createProfile(
  profile: CreateProfileRequest,
  accessToken: string,
): Promise<void> {
  await api.post("/profiles", profile, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
