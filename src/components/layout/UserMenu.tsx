import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
   ChevronDown,
   LayoutDashboard,
   LogOut,
   MonitorSmartphone,
   ScanLine,
   Store,
   Ticket,
   UserCog,
} from 'lucide-react';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import { Link, useLocation, useNavigate, type Location, type NavigateFunction } from 'react-router-dom';
import { logout, logoutAll } from '@/api/auth/authApi';
import { getErrorMessage } from '@/lib/common/apiError';
import UserAvatar from '@/components/common/UserAvatar';
import { getPrimaryRoleLabel } from '@/lib/auth/roleLabels';
import { cn } from '@/lib/common/utils';
import { useOutsideClick } from '@/lib/common/useOutsideClick';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth/auth';

interface UserMenuProps {
   user: User;
}

export function UserMenu({ user }: UserMenuProps): ReactElement {
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const [signOutErrorMessage, setSignOutErrorMessage] = useState<string | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const queryClient: QueryClient = useQueryClient();
   const navigate: NavigateFunction = useNavigate();
   const location: Location = useLocation();
   const clearSession: () => void = useAuthStore((authState) => authState.logout);

   const closeMenu: () => void = useCallback((): void => setIsOpen(false), []);
   useOutsideClick(containerRef, closeMenu);

   function finishSignOut(): void {
      clearSession();
      queryClient.clear();
      setIsOpen(false);
      navigate('/', { replace: true });
   }

   function handleSignOutError(error: unknown): void {
      setSignOutErrorMessage(getErrorMessage(error));
   }

   const logoutMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: logout,
      onMutate: () => setSignOutErrorMessage(null),
      onSuccess: finishSignOut,
      onError: handleSignOutError,
   });
   const logoutAllMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: logoutAll,
      onMutate: () => setSignOutErrorMessage(null),
      onSuccess: finishSignOut,
      onError: handleSignOutError,
   });
   const isSigningOut: boolean = logoutMutation.isPending || logoutAllMutation.isPending;
   const canAccessAdmin: boolean = user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_MANAGER');
   const canAccessStaff: boolean = canAccessAdmin || user.roles.includes('ROLE_STAFF');
   const isInAdminRoute: boolean = location.pathname.startsWith('/admin');
   const isInStaffRoute: boolean = location.pathname.startsWith('/staff');

   return (
      <div ref={containerRef} className="relative">
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            className="flex items-center gap-2.5 rounded-xl border border-white bg-white py-1 pl-1 pr-3 shadow-sm transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
         >
            <UserAvatar user={user} className="size-7" />
            <span className="hidden max-w-[140px] truncate text-sm font-semibold text-ink-800 sm:block">
               {user.fullName}
            </span>
            <ChevronDown
               className={cn('size-4 text-ink-400 transition-transform duration-200', isOpen && 'rotate-180')}
               aria-hidden="true"
            />
         </button>

         {isOpen && (
            <div
               role="menu"
               className="absolute right-0 z-50 mt-2 w-72 origin-top-right animate-fade-up overflow-hidden rounded-lg border border-ink-200 bg-white shadow-soft"
            >
               <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-4 py-3.5">
                  <UserAvatar user={user} className="size-12" />
                  <div className="min-w-0">
                     <p className="truncate text-sm font-bold text-ink-900">{user.fullName}</p>
                     <p className="truncate text-xs text-ink-500">{user.email}</p>
                     <span className="mt-1.5 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-200">
                        {getPrimaryRoleLabel(user)}
                        {user.tier ? ` · ${user.tier}` : ''}
                     </span>
                  </div>
               </div>

               <div className="p-2">
                  <Link
                     to="/profile"
                     role="menuitem"
                     onClick={closeMenu}
                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                     <UserCog className="size-[18px]" aria-hidden="true" />
                     Hồ sơ của tôi
                  </Link>
                  <Link
                     to="/tickets"
                     role="menuitem"
                     onClick={closeMenu}
                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                     <Ticket className="size-[18px]" aria-hidden="true" />
                     Vé của tôi
                  </Link>
                  {canAccessAdmin && (
                     <Link
                        to={isInAdminRoute ? '/' : '/admin'}
                        role="menuitem"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                     >
                        {isInAdminRoute ? (
                           <Store className="size-[18px]" aria-hidden="true" />
                        ) : (
                           <LayoutDashboard className="size-[18px]" aria-hidden="true" />
                        )}
                        {isInAdminRoute ? 'Trang khách hàng' : 'Trang quản trị'}
                     </Link>
                  )}
                  {canAccessStaff && (
                     <Link
                        to={isInStaffRoute ? '/' : '/staff'}
                        role="menuitem"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                     >
                        {isInStaffRoute ? (
                           <Store className="size-[18px]" aria-hidden="true" />
                        ) : (
                           <ScanLine className="size-[18px]" aria-hidden="true" />
                        )}
                        {isInStaffRoute ? 'Trang khách hàng' : 'Trang nhân viên'}
                     </Link>
                  )}
                  <button
                     type="button"
                     role="menuitem"
                     disabled={isSigningOut}
                     onClick={() => logoutAllMutation.mutate()}
                     className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60"
                  >
                     <MonitorSmartphone className="size-[18px]" aria-hidden="true" />
                     Đăng xuất mọi thiết bị
                  </button>
                  <button
                     type="button"
                     role="menuitem"
                     disabled={isSigningOut}
                     onClick={() => logoutMutation.mutate()}
                     className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
                  >
                     <LogOut className="size-[18px]" aria-hidden="true" />
                     {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </button>
                  {signOutErrorMessage && (
                     <p role="alert" className="px-3 pb-1 pt-2 text-[13px] font-medium text-danger-700">
                        {signOutErrorMessage}
                     </p>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}

export default UserMenu;
