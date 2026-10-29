import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import type { AuthUser } from "@/types/user.types";

export function getSessionExpiration(token: string | undefined): number | null {
  if (!token) return null;

  try {
    const payload = jwtDecode<{ exp?: number }>(token);
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function hasValidSession(user: AuthUser | null, isAuthenticated: boolean): boolean {
  const expiresAt = getSessionExpiration(user?.token);
  return isAuthenticated && expiresAt !== null && expiresAt > Date.now();
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  profiles: Record<string, Pick<AuthUser, "name" | "picture">>;

  login: (userData: {
    userId?: string;
    id?: string;
    email: string;
    accessToken?: string;
    token?: string;
    name?: string;
    picture?: string;
    provider?: "local" | "google";
  }, authenticate?: boolean) => void;

  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      isLoading: false,
      profiles: {},

      login: (userData, authenticate = true) => {
        set({ isLoading: true });

        const id = userData.userId ?? userData.id ?? "";
        const savedProfile = id ? get().profiles[id] : undefined;
        const user: AuthUser = {
          id,
          email: userData.email,
          token: userData.accessToken ?? userData.token ?? "",
          name: userData.name ?? savedProfile?.name,
          picture: userData.picture ?? savedProfile?.picture,
          provider: userData.provider ?? "local",
        };

        set((state) => ({
          user,
          isAuthenticated: authenticate,
          isLoading: false,
          profiles: user.name || user.picture
            ? {
              ...state.profiles,
              [id]: {
                name: user.name,
                picture: user.picture,
              },
            }
            : state.profiles,
        }));
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setHasHydrated: (state: boolean) =>
        set({
          isInitializing: !state,
        }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Після того як Zustand підтягне дані з LocalStorage, вимикаємо isInitializing
        state?.setHasHydrated(true);
      },
    }
  )
);
