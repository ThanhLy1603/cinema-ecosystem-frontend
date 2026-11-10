import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
   ArrowRight,
   Building2,
   CalendarClock,
   Clapperboard,
   MessagesSquare,
   ShieldCheck,
   Tag,
   UserPlus,
   Users,
   type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '@/api/adminUserApi';
import { getCinemaOptions } from '@/api/cinemaApi';
import LinkButton from '@/components/ui/LinkButton';
import { getPrimaryRoleLabel } from '@/lib/roleLabels';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AdminUser } from '@/types/admin';
import type { PageResponse } from '@/types/api';
import type { User } from '@/types/auth';
import type { CinemaOption } from '@/types/cinema';
import { ADMIN_CINEMA_OPTIONS_KEY, ADMIN_USER_SUMMARY_KEY } from '../utils/queryKeys';

type ModuleStatus = 'ready' | 'next' | 'soon';

interface AdminModuleCardItem {
   title: string;
   description: string;
   to: string;
   icon: LucideIcon;
   status: ModuleStatus;
   actionLabel: string;
}

const STATUS_BADGE_MAP: Record<ModuleStatus, { label: string; className: string }> = {
   ready: { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
   next: { label: 'Tiếp theo', className: 'bg-accent-50 text-accent-600 ring-accent-200' },
   soon: { label: 'Sắp ra mắt', className: 'bg-ink-50 text-ink-600 ring-ink-200' },
};

const ADMIN_MODULE_ITEMS: AdminModuleCardItem[] = [
   {
      title: 'Quản lý người dùng & nhân sự',
      description: 'Tìm kiếm tài khoản, thêm nhân viên, khóa/mở khóa, phân quyền và gán chi nhánh làm việc.',
      to: '/admin/users',
      icon: Users,
      status: 'ready',
      actionLabel: 'Mở quản lý người dùng',
   },
   {
      title: 'Cụm rạp, phòng chiếu & sơ đồ ghế',
      description: 'Quản lý chi nhánh rạp, tiện ích đi kèm, phòng chiếu 2D/3D/IMAX/4DX và ma trận ghế.',
      to: '/admin/cinemas',
      icon: Building2,
      status: 'next',
      actionLabel: 'Xem lộ trình phân hệ',
   },
   {
      title: 'Quản lý phim',
      description: 'Cập nhật phim đang chiếu/sắp chiếu, thể loại, thời lượng, giới hạn tuổi và trailer.',
      to: '/admin/movies',
      icon: Clapperboard,
      status: 'soon',
      actionLabel: 'Xem chi tiết',
   },
   {
      title: 'Suất chiếu & giá vé động',
      description: 'Xếp lịch chiếu theo phòng, kiểm tra trùng giờ và thiết lập phụ thu theo khung giờ/loại ghế.',
      to: '/admin/showtimes',
      icon: CalendarClock,
      status: 'soon',
      actionLabel: 'Xem chi tiết',
   },
   {
      title: 'Khuyến mãi & combo F&B',
      description: 'Tạo mã giảm giá, quy tắc theo hạng thành viên và danh mục bắp nước tại quầy.',
      to: '/admin/promotions',
      icon: Tag,
      status: 'soon',
      actionLabel: 'Xem chi tiết',
   },
   {
      title: 'Cộng đồng & blog điện ảnh',
      description: 'Soạn bài viết với trình soạn thảo phong phú và kiểm duyệt đánh giá, bình luận của khán giả.',
      to: '/admin/community',
      icon: MessagesSquare,
      status: 'soon',
      actionLabel: 'Xem chi tiết',
   },
];

function formatCount(isPending: boolean, isError: boolean, count?: number): string {
   if (isPending) {
      return '...';
   }
   if (isError || count === undefined) {
      return '—';
   }
   return count.toLocaleString('vi-VN');
}

export function AdminDashboardPage(): ReactElement {
   const user: User | null = useAuthStore((authState) => authState.user);
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const userSummaryQuery: UseQueryResult<PageResponse<AdminUser>> = useQuery<PageResponse<AdminUser>>({
      queryKey: ADMIN_USER_SUMMARY_KEY,
      queryFn: () => searchUsers({ page: 0, size: 1 }),
   });
   const cinemaOptionsQuery: UseQueryResult<CinemaOption[]> = useQuery<CinemaOption[]>({
      queryKey: ADMIN_CINEMA_OPTIONS_KEY,
      queryFn: getCinemaOptions,
   });

   const userCountLabel: string = formatCount(
      userSummaryQuery.isPending,
      userSummaryQuery.isError,
      userSummaryQuery.data?.totalElements,
   );
   const cinemaCountLabel: string = formatCount(
      cinemaOptionsQuery.isPending,
      cinemaOptionsQuery.isError,
      cinemaOptionsQuery.data?.length,
   );
   const roleLabel: string = user ? getPrimaryRoleLabel(user) : 'Quản trị';

   return (
      <div className="w-full max-w-6xl space-y-8">
         <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
               <div className="max-w-2xl space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
                     <ShieldCheck className="size-3.5" aria-hidden="true" />
                     {roleLabel}
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
                     Chào {user?.fullName ?? 'bạn'}, quản trị CinemaSphere
                  </h1>
                  <p className="text-sm leading-relaxed text-ink-500">
                     {isAdmin
                        ? 'Bạn có toàn quyền quản trị tài khoản, phân công nhân sự, cấu hình cụm rạp và vận hành toàn hệ thống.'
                        : 'Bạn đang truy cập cổng quản trị theo phạm vi các chi nhánh được phân công.'}
                  </p>
               </div>
               <div className="flex flex-wrap items-center gap-3">
                  <LinkButton to="/admin/users" icon={<Users className="size-4" aria-hidden="true" />}>
                     Quản lý người dùng
                  </LinkButton>
                  <LinkButton
                     to="/admin/users/new"
                     variant="secondary"
                     icon={<UserPlus className="size-4" aria-hidden="true" />}
                  >
                     Thêm nhân viên
                  </LinkButton>
               </div>
            </div>
         </section>

         <section className="grid gap-5 sm:grid-cols-3">
            <Link
               to="/admin/users"
               className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
               <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-500">Người dùng trong phạm vi</span>
                  <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                     <Users className="size-5" aria-hidden="true" />
                  </span>
               </div>
               <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">{userCountLabel}</p>
               <p className="mt-1 text-xs font-semibold text-brand-700 group-hover:underline">
                  Xem danh sách người dùng
               </p>
            </Link>

            <Link
               to="/admin/cinemas"
               className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
               <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-500">Cụm rạp trong phạm vi</span>
                  <span className="grid size-10 place-items-center rounded-2xl bg-accent-50 text-accent-600">
                     <Building2 className="size-5" aria-hidden="true" />
                  </span>
               </div>
               <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">{cinemaCountLabel}</p>
               <p className="mt-1 text-xs font-semibold text-ink-600 group-hover:text-brand-700">
                  Phân hệ quản lý rạp sắp triển khai
               </p>
            </Link>

            <Link
               to="/profile"
               className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
               <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-500">Phạm vi quyền hạn</span>
                  <span className="grid size-10 place-items-center rounded-2xl bg-ink-50 text-ink-700">
                     <ShieldCheck className="size-5" aria-hidden="true" />
                  </span>
               </div>
               <p className="mt-4 text-xl font-extrabold tracking-tight text-ink-900">{roleLabel}</p>
               <p className="mt-2 text-xs font-semibold text-ink-600 group-hover:text-brand-700">
                  {isAdmin ? 'Toàn hệ thống CinemaSphere' : 'Giới hạn theo chi nhánh phụ trách'}
               </p>
            </Link>
         </section>

         <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
               <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-ink-900">Các phân hệ quản trị</h2>
                  <p className="mt-1 text-sm text-ink-500">
                     Truy cập nhanh các công cụ đang hoạt động và các phân hệ đang hoàn thiện tiếp theo.
                  </p>
               </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
               {ADMIN_MODULE_ITEMS.map((adminModuleCardItem) => {
                  const statusBadge: { label: string; className: string } =
                     STATUS_BADGE_MAP[adminModuleCardItem.status];
                  return (
                     <article
                        key={adminModuleCardItem.to}
                        className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                     >
                        <div>
                           <div className="flex items-start justify-between gap-3">
                              <span
                                 className={cn(
                                    'grid size-12 place-items-center rounded-2xl',
                                    adminModuleCardItem.status === 'ready'
                                       ? 'bg-brand-50 text-brand-600'
                                       : adminModuleCardItem.status === 'next'
                                         ? 'bg-accent-50 text-accent-600'
                                         : 'bg-ink-50 text-ink-600',
                                 )}
                              >
                                 <adminModuleCardItem.icon className="size-6" aria-hidden="true" />
                              </span>
                              <span
                                 className={cn(
                                    'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1',
                                    statusBadge.className,
                                 )}
                              >
                                 {statusBadge.label}
                              </span>
                           </div>
                           <h3 className="mt-5 text-lg font-bold text-ink-900">{adminModuleCardItem.title}</h3>
                           <p className="mt-2 text-sm leading-relaxed text-ink-500">
                              {adminModuleCardItem.description}
                           </p>
                        </div>

                        <div className="mt-6 border-t border-ink-100 pt-4">
                           <Link
                              to={adminModuleCardItem.to}
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
                           >
                              {adminModuleCardItem.actionLabel}
                              <ArrowRight className="size-4" aria-hidden="true" />
                           </Link>
                        </div>
                     </article>
                  );
               })}
            </div>
         </section>
      </div>
   );
}

export default AdminDashboardPage;
