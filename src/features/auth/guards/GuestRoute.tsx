import type { ReactElement } from 'react'
import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom'
import { getRedirectPath } from '../utils/redirect'
import { useAuthStore } from '@/stores/useAuthStore'
import FullPageSpinner from '@/components/common/FullPageSpinner'

export function GuestRoute(): ReactElement {
   const isAuthenticated: boolean = useAuthStore((authState) => authState.isAuthenticated)
   const isLoading: boolean = useAuthStore((authState) => authState.isLoading)
   const location: Location = useLocation()

   if (isLoading) {
      return <FullPageSpinner />
   }

   if (isAuthenticated) {
      return <Navigate to={getRedirectPath(location.state)} replace />
   }

   return <Outlet />
}

export default GuestRoute
