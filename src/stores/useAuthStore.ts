import { create } from 'zustand'
import type { User, UserRole } from '@/types/auth'

interface AuthState {
   user: User | null
   accessToken: string | null
   isAuthenticated: boolean
   isLoading: boolean

   // Actions
   setAuth: (user: User, accessToken: string) => void
   setAccessToken: (accessToken: string | null) => void
   setUser: (user: User | null) => void
   setLoading: (loading: boolean) => void
   logout: () => void
   hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
   user: null,
   accessToken: null,
   isAuthenticated: false,
   isLoading: true,

   setAuth: (user: User, accessToken: string) =>
      set({
         user,
         accessToken,
         isAuthenticated: true,
         isLoading: false,
      }),

   setAccessToken: (accessToken: string | null) =>
      set({
         accessToken,
         isAuthenticated: Boolean(accessToken),
      }),

   setUser: (user: User | null) =>
      set({
         user,
      }),

   setLoading: (isLoading: boolean) =>
      set({
         isLoading,
      }),

   logout: () =>
      set({
         user: null,
         accessToken: null,
         isAuthenticated: false,
         isLoading: false,
      }),

   hasRole: (role: UserRole) => {
      const { user } = get()
      return Boolean(user?.roles?.includes(role))
   },
}))
