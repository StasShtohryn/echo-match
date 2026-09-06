import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/user.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      profiles: {},

      login: (userData, authenticate = true) => {
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
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
