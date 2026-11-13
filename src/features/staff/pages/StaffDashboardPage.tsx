import { MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { getPrimaryRoleLabel } from '@/lib/auth/roleLabels';
import { formatDisplayDate, todayInVietnam } from '@/lib/common/vietnamTime';
import { STAFF_NAV_ITEMS, type StaffNavItem } from '@/lib/staff/staffNavItems';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import { useAuthStore } from '@/stores/useAuthStore';
import StaffOverviewPanel from '../components/StaffOverviewPanel';
import type { User } from '@/types/auth/auth';

export function StaffDashboardPage(): ReactElement {
   const user: User | null = useAuthStore((authState) => authState.user);
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const workItems: StaffNavItem[] = STAFF_NAV_ITEMS.filter((staffNavItem) => staffNavItem.to !== '/staff');

   return (
      <div className="space-y-8">
         <header className="space-y-2">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
               Xin chào{user ? `, ${user.fullName}` : ''}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-700">
               <span>{user ? getPrimaryRoleLabel(user) : 'Nhân viên rạp'}</span>
               <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-brand-600" aria-hidden="true" />
                  {staffBranchSelection.currentBranch?.cinemaName ?? 'Chưa chọn chi nhánh'}
               </span>
               <span>{formatDisplayDate(todayInVietnam())}</span>
            </p>
         </header>

         {staffBranchSelection.currentBranch !== null && (
            <StaffOverviewPanel cinemaId={staffBranchSelection.currentBranch.cinemaId} />
         )}

         <section aria-labelledby="staff-work-heading" className="space-y-4">
            <h2 id="staff-work-heading" className="text-sm font-extrabold uppercase tracking-wider text-ink-500">
               Công việc tại quầy
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
               {workItems.map((workItem) => (
                  <li key={workItem.to}>
                     <Link
                        to={workItem.to}
                        className="group flex h-full items-start gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                     >
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                           <workItem.icon className="size-6" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 space-y-1">
                           <span className="flex items-center gap-2">
                              <span className="font-extrabold text-ink-900 group-hover:text-brand-700">
                                 {workItem.label}
                              </span>
                              {!workItem.isReady && (
                                 <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-500">
                                    Sắp có
                                 </span>
                              )}
                           </span>
                           <span className="block text-sm text-ink-700">{workItem.description}</span>
                        </span>
                     </Link>
                  </li>
               ))}
            </ul>
         </section>
      </div>
   );
}

export default StaffDashboardPage;
