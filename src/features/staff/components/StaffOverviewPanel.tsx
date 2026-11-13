import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Banknote, PackageCheck, ScanLine, Wallet } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { getStaffOverview } from '@/api/staff/overviewApi';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatClockRange } from '@/lib/common/vietnamTime';
import { staffOverviewKey } from '@/lib/staff/staffQueryKeys';
import type { ShowtimeOverview, StaffOverview } from '@/types/staff/overview';

const OVERVIEW_REFETCH_INTERVAL_MS: number = 15_000;

interface StaffOverviewPanelProps {
   cinemaId: number;
}

interface StatCardProps {
   label: string;
   value: string;
   icon: ReactElement;
   to: string;
   hint?: string;
}

function StatCard({ label, value, icon, to, hint }: StatCardProps): ReactElement {
   return (
      <Link
         to={to}
         className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
         <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">{icon}</span>
         <span className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-wide text-ink-500">{label}</span>
            <span className="block text-2xl font-extrabold text-ink-900">{value}</span>
            {hint && <span className="block text-xs text-ink-600">{hint}</span>}
         </span>
      </Link>
   );
}

function renderShowtime(showtimeOverview: ShowtimeOverview): ReactElement {
   const soldPercent: number =
      showtimeOverview.capacity === 0
         ? 0
         : Math.min(100, Math.round((showtimeOverview.soldSeats / showtimeOverview.capacity) * 100));
   return (
      <li key={showtimeOverview.showtimeId} className="space-y-2 px-4 py-3">
         <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-extrabold text-ink-900">{showtimeOverview.movieTitle}</span>
            <span className="text-sm text-ink-700">
               {showtimeOverview.hallName}
               {showtimeOverview.screenType ? ` · ${showtimeOverview.screenType}` : ''}
            </span>
            <span className="text-sm font-bold text-ink-900">
               {formatClockRange(showtimeOverview.startTime, showtimeOverview.endTime)}
            </span>
            {showtimeOverview.nowShowing && (
               <span className="rounded-md bg-accent-100 px-2 py-0.5 text-xs font-extrabold text-accent-700">
                  Đang chiếu
               </span>
            )}
         </div>
         <div className="h-2 overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${soldPercent}%` }} />
         </div>
         <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-brand-800">
               Đã bán {showtimeOverview.soldSeats} / {showtimeOverview.capacity}
            </span>
            <span className="rounded-md bg-ink-100 px-2 py-0.5 text-ink-800">
               Đã vào {showtimeOverview.checkedInSeats}
            </span>
            <span className="rounded-md bg-accent-100 px-2 py-0.5 text-accent-700">
               Còn trống {showtimeOverview.availableSeats}
            </span>
            {showtimeOverview.heldSeats > 0 && (
               <span className="rounded-md bg-ink-100 px-2 py-0.5 text-ink-700">
                  Đang giữ {showtimeOverview.heldSeats}
               </span>
            )}
         </div>
      </li>
   );
}

export function StaffOverviewPanel({ cinemaId }: StaffOverviewPanelProps): ReactElement {
   const overviewQuery: UseQueryResult<StaffOverview> = useQuery<StaffOverview>({
      queryKey: staffOverviewKey(cinemaId),
      queryFn: () => getStaffOverview(cinemaId),
      refetchInterval: OVERVIEW_REFETCH_INTERVAL_MS,
   });
   const staffOverview: StaffOverview | undefined = overviewQuery.data;

   if (overviewQuery.isError) {
      return <Alert variant="error">{getErrorMessage(overviewQuery.error)}</Alert>;
   }
   if (staffOverview === undefined) {
      return <p className="text-sm text-ink-500">Đang tải tổng quan...</p>;
   }
   const currentShift: StaffOverview['currentShift'] = staffOverview.currentShift;

   return (
      <div className="space-y-6">
         <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <li>
               <StatCard
                  label="Vé chờ soát"
                  value={String(staffOverview.pendingCheckInTicketCount)}
                  icon={<ScanLine className="size-6" aria-hidden="true" />}
                  to="/staff/check-in"
                  hint="Trong 24 giờ tới"
               />
            </li>
            <li>
               <StatCard
                  label="Đơn bắp nước chờ giao"
                  value={String(staffOverview.pendingFnbBookingCount)}
                  icon={<PackageCheck className="size-6" aria-hidden="true" />}
                  to="/staff/fnb-pickup"
                  hint="Trong 24 giờ tới"
               />
            </li>
            <li>
               <StatCard
                  label="Doanh thu ca"
                  value={currentShift ? formatVnd(currentShift.shift.totalSales) : 'Chưa mở ca'}
                  icon={<Wallet className="size-6" aria-hidden="true" />}
                  to="/staff/shifts"
                  hint={currentShift ? `${currentShift.shift.orderCount} đơn trong ca` : 'Bấm để mở ca'}
               />
            </li>
            <li>
               <StatCard
                  label="Tiền mặt dự kiến"
                  value={currentShift ? formatVnd(currentShift.shift.expectedCash ?? 0) : '...'}
                  icon={<Banknote className="size-6" aria-hidden="true" />}
                  to="/staff/shifts"
                  hint="Đầu ca cộng thu tiền mặt"
               />
            </li>
         </ul>

         <section aria-labelledby="staff-showtimes-heading" className="space-y-3">
            <h2 id="staff-showtimes-heading" className="text-sm font-extrabold uppercase tracking-wider text-ink-500">
               Suất chiếu còn lại trong ngày
            </h2>
            {staffOverview.showtimes.length === 0 ? (
               <p className="rounded-2xl bg-white p-5 text-sm text-ink-500 shadow-md ring-1 ring-ink-100">
                  Không còn suất chiếu nào trong ngày hôm nay.
               </p>
            ) : (
               <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100">
                  {staffOverview.showtimes.map(renderShowtime)}
               </ul>
            )}
         </section>
      </div>
   );
}

export default StaffOverviewPanel;
