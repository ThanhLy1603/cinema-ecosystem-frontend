import { Menu, Store } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { Link, Outlet, useLocation, type Location } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth/auth';
import AdminSidebar from './AdminSidebar';
import UserMenu from './UserMenu';

interface RouteTitleRule {
   prefix: string;
   title: string;
}

const ADMIN_TITLE_RULES: RouteTitleRule[] = [
   { prefix: '/admin/users/new', title: 'Thêm nhân viên' },
   { prefix: '/admin/users/', title: 'Chi tiết người dùng' },
   { prefix: '/admin/users', title: 'Quản lý người dùng' },
   { prefix: '/admin/cinemas', title: 'Cụm rạp & phòng chiếu' },
   { prefix: '/admin/movies', title: 'Quản lý phim' },
   { prefix: '/admin/showtimes', title: 'Suất chiếu' },
   { prefix: '/admin/price-rules', title: 'Cấu hình giá vé' },
   { prefix: '/admin/promotions', title: 'Khuyến mãi & F&B' },
   { prefix: '/admin/community', title: 'Cộng đồng & blog' },
];

function getAdminPageTitle(pathname: string): string {
   const routeTitleRule: RouteTitleRule | undefined = ADMIN_TITLE_RULES.find((rule) =>
      pathname.startsWith(rule.prefix),
   );
   return routeTitleRule ? routeTitleRule.title : 'Tổng quan quản trị';
}

export function AdminLayout(): ReactElement {
   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
   const user: User | null = useAuthStore((authState) => authState.user);
   const location: Location = useLocation();
   const pageTitle: string = getAdminPageTitle(location.pathname);

   useEffect(() => {
      if (!isSidebarOpen) {
         return;
      }
      function handleKeyDown(keyboardEvent: KeyboardEvent): void {
         if (keyboardEvent.key === 'Escape') {
            setIsSidebarOpen(false);
         }
      }
      window.addEventListener('keydown', handleKeyDown);
      return (): void => {
         window.removeEventListener('keydown', handleKeyDown);
      };
   }, [isSidebarOpen]);

   return (
      <div className="flex min-h-screen bg-cream">
         <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:shrink-0">
            <AdminSidebar user={user} />
         </aside>

         {isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
               <button
                  type="button"
                  aria-label="Đóng menu điều hướng"
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-ink-900/30 backdrop-blur-xs"
               />
               <aside className="relative z-10 h-full shadow-soft">
                  <AdminSidebar
                     user={user}
                     onNavigate={() => setIsSidebarOpen(false)}
                     onClose={() => setIsSidebarOpen(false)}
                  />
               </aside>
            </div>
         )}

         <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-ink-100/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
               <div className="flex min-w-0 items-center gap-3">
                  <button
                     type="button"
                     onClick={() => setIsSidebarOpen(true)}
                     aria-label="Mở menu quản trị"
                     aria-expanded={isSidebarOpen}
                     className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 lg:hidden"
                  >
                     <Menu className="size-5" aria-hidden="true" />
                  </button>
                  <div className="min-w-0">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Trang quản trị</p>
                     <p className="truncate text-base font-extrabold text-ink-900">{pageTitle}</p>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <Link
                     to="/"
                     className="hidden items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
                  >
                     <Store className="size-4" aria-hidden="true" />
                     Trang khách hàng
                  </Link>
                  {user && <UserMenu user={user} />}
               </div>
            </header>

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
               <Outlet />
            </main>
         </div>
      </div>
   );
}

export default AdminLayout;
