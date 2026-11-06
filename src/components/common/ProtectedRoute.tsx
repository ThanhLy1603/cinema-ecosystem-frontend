import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import type { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
   roles?: UserRole[]
   redirectTo?: string
}

export function ProtectedRoute({ roles, redirectTo = '/login' }: ProtectedRouteProps) {
   const { isAuthenticated, user, isLoading } = useAuthStore()
   const location = useLocation()

   if (isLoading) {
      return (
         <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
         </div>
      )
   }

   if (!isAuthenticated || !user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />
   }

   if (roles && roles.length > 0) {
      const hasRequiredRole = roles.some((role) => user.roles?.includes(role))
      if (!hasRequiredRole) {
         return <Navigate to="/forbidden" replace />
      }
   }

   return <Outlet />
}

export default ProtectedRoute
