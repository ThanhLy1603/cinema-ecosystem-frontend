import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom';
import { getPostLoginPath, getRedirectPath } from '../utils/redirect';
import { useAuthStore } from '@/stores/useAuthStore';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import type { User } from '@/types/auth/auth';

export function GuestRoute(): ReactElement {
   const isAuthenticated: boolean = useAuthStore((authState) => authState.isAuthenticated);
   const isLoading: boolean = useAuthStore((authState) => authState.isLoading);
   const user: User | null = useAuthStore((authState) => authState.user);
   const location: Location = useLocation();

   if (isLoading) {
      return <FullPageSpinner />;
   }

   if (isAuthenticated) {
      return <Navigate to={getPostLoginPath(getRedirectPath(location.state), user)} replace />;
   }

   return <Outlet />;
}

export default GuestRoute;
