import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "./types";
import api from "./api";

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
        // Clear client-side auth immediately
        set({ user: null, token: null });

        // Notify server to clear cookie (fire-and-forget)
        try {
          api.post("/auth/logout").catch((e) => {
            console.warn("[AUTH] Server logout failed:", e?.response?.data || e.message);
          });
        } catch (e) {
          // ignore
        }
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
