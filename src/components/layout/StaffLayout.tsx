import { ChevronRight, Menu, MapPin, Store } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { Link, Outlet, useLocation, type Location } from 'react-router-dom';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { STAFF_NAV_ITEMS, type StaffNavItem } from '@/lib/staff/staffNavItems';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth/auth';
import StaffSidebar from './StaffSidebar';
import UserMenu from './UserMenu';

const DEFAULT_PAGE_TITLE: string = 'Tổng quan';

function getStaffPageTitle(pathname: string): string {
   const matchedNavItem: StaffNavItem | undefined = STAFF_NAV_ITEMS.filter((staffNavItem) => !staffNavItem.end).find(
      (staffNavItem) => pathname.startsWith(staffNavItem.to),
   );
   return matchedNavItem ? matchedNavItem.label : DEFAULT_PAGE_TITLE;
}

export function StaffLayout(): ReactElement {
   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
   const user: User | null = useAuthStore((authState) => authState.user);
   const location: Location = useLocation();
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const pageTitle: string = getStaffPageTitle(location.pathname);
   const branchOptions: SelectOption[] = staffBranchSelection.branches.map((branch) => ({
      value: String(branch.cinemaId),
      label: branch.cinemaName ?? `Chi nhánh ${branch.cinemaId}`,
   }));

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

   function handleBranchChange(cinemaId: string): void {
      if (cinemaId !== '') {
         staffBranchSelection.selectBranch(Number(cinemaId));
      }
   }

   function renderBranchControl(): ReactElement | null {
      if (staffBranchSelection.branches.length === 0) {
         return null;
      }
      if (staffBranchSelection.branches.length === 1) {
         return (
            <span className="hidden items-center gap-2 rounded-lg bg-ink-100 px-3 py-1.5 text-[13px] font-semibold text-ink-800 sm:inline-flex">
               <MapPin className="size-4 text-brand-600" aria-hidden="true" />
               {branchOptions[0].label}
            </span>
         );
      }
      return (
         <div className="hidden w-64 sm:block">
            <SelectField
               id="staff-branch"
               label="Chi nhánh đang làm việc"
               hideLabel
               value={staffBranchSelection.currentBranch ? String(staffBranchSelection.currentBranch.cinemaId) : ''}
               onChange={handleBranchChange}
               options={branchOptions}
               placeholder="Chọn chi nhánh"
               triggerClassName="h-9 text-[13px] font-semibold"
               menuClassName="right-0 w-72"
            />
         </div>
      );
   }

   function renderMainContent(): ReactElement {
      if (staffBranchSelection.isLoading) {
         return <FullPageSpinner />;
      }
      if (staffBranchSelection.isError) {
         return <Alert variant="error">Không tải được thông tin chi nhánh. Vui lòng tải lại trang.</Alert>;
      }
      if (staffBranchSelection.branches.length === 0) {
         return (
            <Alert variant="info">
               Tài khoản của bạn chưa được gán chi nhánh nào. Vui lòng liên hệ quản lý để được phân công.
            </Alert>
         );
      }
      return <Outlet />;
   }

   return (
      <div className="theme-shinkai flex min-h-screen bg-cream">
         <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:shrink-0">
            <StaffSidebar user={user} />
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
                  <StaffSidebar
                     user={user}
                     onNavigate={() => setIsSidebarOpen(false)}
                     onClose={() => setIsSidebarOpen(false)}
                  />
               </aside>
            </div>
         )}

         <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-ink-200 bg-white px-4 sm:px-6 lg:px-8">
               <div className="flex min-w-0 items-center gap-3">
                  <button
                     type="button"
                     onClick={() => setIsSidebarOpen(true)}
                     aria-label="Mở menu nhân viên"
                     aria-expanded={isSidebarOpen}
                     className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-700 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 lg:hidden"
                  >
                     <Menu className="size-5" aria-hidden="true" />
                  </button>
                  <nav aria-label="Vị trí hiện tại" className="flex min-w-0 items-center gap-1.5 text-sm">
                     <span className="text-ink-500">Nhân viên</span>
                     <ChevronRight className="size-3.5 shrink-0 text-ink-300" aria-hidden="true" />
                     <span className="truncate font-semibold text-ink-900">{pageTitle}</span>
                  </nav>
               </div>

               <div className="flex items-center gap-3">
                  {renderBranchControl()}
                  <Link
                     to="/"
                     className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 md:inline-flex"
                  >
                     <Store className="size-4" aria-hidden="true" />
                     Trang khách hàng
                  </Link>
                  {user && <UserMenu user={user} />}
               </div>
            </header>

            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{renderMainContent()}</main>
         </div>
      </div>
   );
}

export default StaffLayout;
