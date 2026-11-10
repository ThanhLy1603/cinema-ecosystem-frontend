import {
   ArrowLeft,
   Building2,
   CalendarClock,
   Clapperboard,
   LayoutDashboard,
   MessagesSquare,
   Tag,
   Users,
   X,
   type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { getPrimaryRoleLabel } from '@/lib/roleLabels';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

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
   { label: 'Khuyến mãi & F&B', to: '/admin/promotions', icon: Tag, status: 'soon' },
   { label: 'Cộng đồng & blog', to: '/admin/community', icon: MessagesSquare, status: 'soon' },
];

function getNavLinkClassName(isActive: boolean): string {
   return cn(
      'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all',
      isActive
         ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
         : 'text-ink-600 hover:bg-ink-50 hover:text-brand-700',
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
               'ml-auto shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
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
            'ml-auto shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
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
      <div className="flex h-full w-72 flex-col border-r border-ink-100 bg-white text-ink-900">
         <div className="flex h-[72px] items-center justify-between border-b border-ink-100 px-5">
            <div className="flex items-center gap-2">
               <Logo to="/admin" />
               <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
                  Admin
               </span>
            </div>
            {onClose && (
               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng thanh điều hướng"
                  className="grid size-9 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 lg:hidden"
               >
                  <X className="size-5" aria-hidden="true" />
               </button>
            )}
         </div>

         <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-ink-400">
               Không gian quản trị
            </p>
            <nav className="space-y-1.5" aria-label="Điều hướng quản trị">
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

         <div className="space-y-3 border-t border-ink-100 p-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 px-3.5 py-3 ring-1 ring-brand-100">
               <p className="text-xs font-bold text-ink-900">{primaryRoleLabel}</p>
               <p className="mt-0.5 text-xs text-ink-600">
                  {isAdmin ? 'Phạm vi: Toàn hệ thống' : 'Phạm vi: Theo chi nhánh phụ trách'}
               </p>
            </div>
            <Link
               to="/"
               onClick={onNavigate}
               className="flex items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Về trang khách hàng
            </Link>
         </div>
      </div>
   );
}

export default AdminSidebar;
