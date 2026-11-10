import {
   ArrowLeft,
   BadgeDollarSign,
   Building2,
   CalendarClock,
   Clapperboard,
   LayoutDashboard,
   MessagesSquare,
   Popcorn,
   Tag,
   Users,
   X,
   type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { getPrimaryRoleLabel } from '@/lib/auth/roleLabels';
import { cn } from '@/lib/common/utils';
import type { User } from '@/types/auth/auth';

type AdminNavStatus = 'ready' | 'next' | 'soon';

interface AdminNavItem {
   label: string;
   to: string;
   icon: LucideIcon;
   end?: boolean;
   status: AdminNavStatus;
}

interface AdminSidebarProps {
   user: User | null;
   onNavigate?: () => void;
   onClose?: () => void;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
   { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, end: true, status: 'ready' },
   { label: 'Người dùng & nhân sự', to: '/admin/users', icon: Users, status: 'ready' },
   { label: 'Cụm rạp', to: '/admin/cinemas', icon: Building2, status: 'ready' },
   { label: 'Phim', to: '/admin/movies', icon: Clapperboard, status: 'ready' },
   { label: 'Suất chiếu', to: '/admin/showtimes', icon: CalendarClock, status: 'ready' },
   { label: 'Giá vé', to: '/admin/price-rules', icon: BadgeDollarSign, status: 'ready' },
   { label: 'Đồ ăn & nước', to: '/admin/fnb', icon: Popcorn, status: 'ready' },
   { label: 'Khuyến mãi', to: '/admin/promotions', icon: Tag, status: 'soon' },
   { label: 'Cộng đồng & blog', to: '/admin/community', icon: MessagesSquare, status: 'soon' },
];

function getNavLinkClassName(isActive: boolean): string {
   return cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
   );
}

function renderStatusBadge(adminNavStatus: AdminNavStatus, isActive: boolean): ReactElement | null {
   if (adminNavStatus === 'ready') {
      return null;
   }
   if (adminNavStatus === 'next') {
      return (
         <span
            className={cn(
               'ml-auto shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium',
               isActive
                  ? 'bg-white text-brand-700 ring-1 ring-brand-100'
                  : 'bg-accent-50 text-accent-600 ring-1 ring-accent-200',
            )}
         >
            Tiếp theo
         </span>
      );
   }
   return (
      <span
         className={cn(
            'ml-auto shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium',
            isActive ? 'bg-white text-brand-700 ring-1 ring-brand-100' : 'bg-ink-100 text-ink-500',
         )}
      >
         Sắp có
      </span>
   );
}

export function AdminSidebar({ user, onNavigate, onClose }: AdminSidebarProps): ReactElement {
   const isAdmin: boolean = Boolean(user?.roles.includes('ROLE_ADMIN'));
   const primaryRoleLabel: string = user ? getPrimaryRoleLabel(user) : 'Quản trị';

   return (
      <div className="flex h-full w-[17rem] flex-col border-r border-ink-200 bg-white text-ink-900">
         <div className="flex h-14 items-center justify-between border-b border-ink-200 px-4">
            <div className="flex items-center gap-2">
               <Logo to="/admin" />
            </div>
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
            <nav className="space-y-0.5" aria-label="Điều hướng quản trị">
               {ADMIN_NAV_ITEMS.map((adminNavItem) => (
                  <NavLink
                     key={adminNavItem.to}
                     to={adminNavItem.to}
                     end={adminNavItem.end}
                     onClick={onNavigate}
                     className={({ isActive }) => getNavLinkClassName(isActive)}
                  >
                     {({ isActive }) => (
                        <>
                           <adminNavItem.icon className="size-[18px] shrink-0" aria-hidden="true" />
                           <span className="truncate">{adminNavItem.label}</span>
                           {renderStatusBadge(adminNavItem.status, isActive)}
                        </>
                     )}
                  </NavLink>
               ))}
            </nav>
         </div>

         <div className="space-y-2 border-t border-ink-200 p-3">
            <div className="px-3 py-1">
               <p className="text-[13px] font-semibold text-ink-900">{primaryRoleLabel}</p>
               <p className="text-xs text-ink-500">
                  {isAdmin ? 'Phạm vi: Toàn hệ thống' : 'Phạm vi: Theo chi nhánh phụ trách'}
               </p>
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

export default AdminSidebar;
