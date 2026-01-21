import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  isAuthenticated: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,

      // Return true if a token exists
      isAuthenticated: () => {
        return !!get().token;
      },

      setAuth: (user, token) => {
        console.log("[AUTH STORE] setAuth", user, token);
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    }
  )
);
