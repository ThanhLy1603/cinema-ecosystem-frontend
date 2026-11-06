import { create, type StoreApi, type UseBoundStore } from 'zustand'
import type { User, UserRole } from '@/types/auth'

interface AuthState {
   user: User | null
   accessToken: string | null
   isAuthenticated: boolean
   isLoading: boolean

   setAuth: (user: User, accessToken: string) => void
   setAccessToken: (accessToken: string | null) => void
   setUser: (user: User | null) => void
   setLoading: (loading: boolean) => void
   logout: () => void
   hasRole: (userRole: UserRole) => boolean
}

export const useAuthStore: UseBoundStore<StoreApi<AuthState>> = create<AuthState>((set, get) => ({
   user: null,
   accessToken: null,
   isAuthenticated: false,
   isLoading: true,

   setAuth(user: User, accessToken: string): void {
      set({
         user,
         accessToken,
         isAuthenticated: true,
         isLoading: false,
      })
   },

   setAccessToken(accessToken: string | null): void {
      set({
         accessToken,
         isAuthenticated: Boolean(accessToken),
      })
   },

   setUser(user: User | null): void {
      set({
         user,
      })
   },

   setLoading(isLoading: boolean): void {
      set({
         isLoading,
      })
   },

   logout(): void {
      set({
         user: null,
         accessToken: null,
         isAuthenticated: false,
         isLoading: false,
      })
   },

   hasRole(userRole: UserRole): boolean {
      const { user } = get()
      return Boolean(user?.roles?.includes(userRole))
   },
}))
