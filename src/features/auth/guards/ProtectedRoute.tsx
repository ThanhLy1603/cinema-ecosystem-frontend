import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserRole } from '@/types/auth';
import FullPageSpinner from '@/components/common/FullPageSpinner';

interface ProtectedRouteProps {
   roles?: UserRole[];
   redirectTo?: string;
}

export function ProtectedRoute({ roles, redirectTo = '/login' }: ProtectedRouteProps): ReactElement {
   const { isAuthenticated, user, isLoading } = useAuthStore();
   const location: Location = useLocation();

   if (isLoading) {
      return <FullPageSpinner />;
   }

   if (!isAuthenticated || !user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
   }

   if (roles && roles.length > 0) {
      const hasRequiredRole: boolean = roles.some((userRole) => user.roles?.includes(userRole));
      if (!hasRequiredRole) {
         return <Navigate to="/forbidden" replace />;
      }
   }

   return <Outlet />;
}

export default ProtectedRoute;
