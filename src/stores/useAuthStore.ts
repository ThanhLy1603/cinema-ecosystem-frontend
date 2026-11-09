import { create, type StoreApi, type UseBoundStore } from 'zustand'
import type { User, UserRole } from '@/types/auth'

interface AuthState {
   user: User | null
   isAuthenticated: boolean
   isLoading: boolean

   setAuth: (user: User) => void
   setUser: (user: User | null) => void
   setLoading: (loading: boolean) => void
   logout: () => void
   hasRole: (userRole: UserRole) => boolean
}

export const useAuthStore: UseBoundStore<StoreApi<AuthState>> = create<AuthState>((set, get) => ({
   user: null,
   isAuthenticated: false,
   isLoading: true,

   setAuth(user: User): void {
      set({
         user,
         isAuthenticated: true,
         isLoading: false,
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
         isAuthenticated: false,
         isLoading: false,
      })
   },

   hasRole(userRole: UserRole): boolean {
      const { user } = get()
      return Boolean(user?.roles?.includes(userRole))
   },
}))
