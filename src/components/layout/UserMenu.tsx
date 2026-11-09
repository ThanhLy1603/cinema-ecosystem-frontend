import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { ChevronDown, LogOut, MonitorSmartphone, Ticket } from 'lucide-react';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router-dom';
import { logout, logoutAll } from '@/api/authApi';
import UserAvatar from '@/components/common/UserAvatar';
import { getPrimaryRoleLabel } from '@/features/auth/utils/roleLabels';
import { cn } from '@/lib/utils';
import { useOutsideClick } from '@/lib/useOutsideClick';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth';

interface UserMenuProps {
   user: User;
}

export function UserMenu({ user }: UserMenuProps): ReactElement {
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const queryClient: QueryClient = useQueryClient();
   const navigate: NavigateFunction = useNavigate();
   const clearSession: () => void = useAuthStore((authState) => authState.logout);

   const closeMenu: () => void = useCallback((): void => setIsOpen(false), []);
   useOutsideClick(containerRef, closeMenu);

   function finishSignOut(): void {
      clearSession();
      queryClient.clear();
      setIsOpen(false);
      navigate('/', { replace: true });
   }

   const logoutMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: logout,
      onSettled: finishSignOut,
   });
   const logoutAllMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: logoutAll,
      onSettled: finishSignOut,
   });
   const isSigningOut: boolean = logoutMutation.isPending || logoutAllMutation.isPending;

   return (
      <div ref={containerRef} className="relative">
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            className="flex items-center gap-2.5 rounded-full border border-ink-100 bg-white py-1 pl-1 pr-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
         >
            <UserAvatar user={user} className="size-9" />
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
               className="absolute right-0 z-50 mt-3 w-72 origin-top-right animate-fade-up overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft"
            >
               <div className="flex items-center gap-3 bg-gradient-to-br from-brand-50 to-gold-50 px-4 py-4">
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
                     to="/tickets"
                     role="menuitem"
                     onClick={closeMenu}
                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                     <Ticket className="size-[18px]" aria-hidden="true" />
                     Vé của tôi
                  </Link>
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
               </div>
            </div>
         )}
      </div>
   );
}

export default UserMenu;
