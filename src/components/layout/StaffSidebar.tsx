import { ArrowLeft, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { getPrimaryRoleLabel } from '@/lib/auth/roleLabels';
import { STAFF_NAV_ITEMS } from '@/lib/staff/staffNavItems';
import { cn } from '@/lib/common/utils';
import type { User } from '@/types/auth/auth';

interface StaffSidebarProps {
   user: User | null;
   onNavigate?: () => void;
   onClose?: () => void;
}

function getNavLinkClassName(isActive: boolean): string {
   return cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
   );
}

export function StaffSidebar({ user, onNavigate, onClose }: StaffSidebarProps): ReactElement {
   const primaryRoleLabel: string = user ? getPrimaryRoleLabel(user) : 'Nhân viên rạp';

   return (
      <div className="flex h-full w-[16rem] flex-col border-r border-ink-200 bg-white text-ink-900">
         <div className="flex h-14 items-center justify-between border-b border-ink-200 px-4">
            <Logo to="/staff" />
            {onClose && (
               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng thanh điều hướng"
                  className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
               >
                  <X className="size-5" aria-hidden="true" />
               </button>
            )}
         </div>

         <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-0.5" aria-label="Điều hướng nhân viên">
               {STAFF_NAV_ITEMS.map((staffNavItem) => (
                  <NavLink
                     key={staffNavItem.to}
                     to={staffNavItem.to}
                     end={staffNavItem.end}
                     onClick={onNavigate}
                     className={({ isActive }) => getNavLinkClassName(isActive)}
                  >
                     {({ isActive }) => (
                        <>
                           <staffNavItem.icon className="size-[18px] shrink-0" aria-hidden="true" />
                           <span className="truncate">{staffNavItem.label}</span>
                           {!staffNavItem.isReady && (
                              <span
                                 className={cn(
                                    'ml-auto shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium',
                                    isActive
                                       ? 'bg-white text-brand-700 ring-1 ring-brand-100'
                                       : 'bg-ink-100 text-ink-500',
                                 )}
                              >
                                 Sắp có
                              </span>
                           )}
                        </>
                     )}
                  </NavLink>
               ))}
            </nav>
         </div>

         <div className="space-y-2 border-t border-ink-200 p-3">
            <div className="px-3 py-1">
               <p className="text-[13px] font-semibold text-ink-900">{primaryRoleLabel}</p>
               <p className="text-xs text-ink-500">Phạm vi: Theo chi nhánh được gán</p>
            </div>
            <Link
               to="/"
               onClick={onNavigate}
               className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Về trang khách hàng
            </Link>
         </div>
      </div>
   );
}

export default StaffSidebar;
