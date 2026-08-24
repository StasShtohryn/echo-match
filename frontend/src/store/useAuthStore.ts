import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GoogleUser } from "@/types/user.types";

interface AuthState {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  login: (userData: GoogleUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);
