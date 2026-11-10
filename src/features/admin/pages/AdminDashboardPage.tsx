import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
   Building2,
   CalendarClock,
   ChevronRight,
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
import { searchAdminMovies } from '@/api/movieApi';
import PageHeader from '@/components/common/PageHeader';
import LinkButton from '@/components/ui/LinkButton';
import { getPrimaryRoleLabel } from '@/lib/auth/roleLabels';
import { cn } from '@/lib/common/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AdminUser } from '@/types/auth/admin';
import type { User } from '@/types/auth/auth';
import type { PageResponse } from '@/types/common/api';
import type { CinemaOption } from '@/types/cinema/cinema';
import type { Movie } from '@/types/movie/movie';
import { ADMIN_CINEMA_OPTIONS_KEY, ADMIN_MOVIE_SUMMARY_KEY, ADMIN_USER_SUMMARY_KEY } from '../utils/queryKeys';

type ModuleStatus = 'ready' | 'soon';

interface AdminModuleItem {
   title: string;
   description: string;
   to: string;
   icon: LucideIcon;
   status: ModuleStatus;
}

interface StatCardItem {
   label: string;
   value: string;
   to: string;
   icon: LucideIcon;
}

const ADMIN_MODULE_ITEMS: AdminModuleItem[] = [
   {
      title: 'Người dùng & nhân sự',
      description: 'Tìm kiếm tài khoản, thêm nhân viên, khóa/mở khóa, phân quyền và gán chi nhánh.',
      to: '/admin/users',
      icon: Users,
      status: 'ready',
   },
   {
      title: 'Cụm rạp, phòng chiếu & sơ đồ ghế',
      description: 'Chi nhánh, tiện ích, phòng chiếu 2D/3D/IMAX/4DX và ma trận ghế.',
      to: '/admin/cinemas',
      icon: Building2,
      status: 'ready',
   },
   {
      title: 'Phim',
      description: 'Danh mục phim, thể loại, nghệ sĩ, nhãn độ tuổi và trailer.',
      to: '/admin/movies',
      icon: Clapperboard,
      status: 'ready',
   },
   {
      title: 'Suất chiếu & giá vé',
      description: 'Xếp lịch theo phòng, chặn trùng giờ, nhân bản lịch và quy tắc phụ thu.',
      to: '/admin/showtimes',
      icon: CalendarClock,
      status: 'ready',
   },
   {
      title: 'Khuyến mãi & F&B',
      description: 'Mã giảm giá, quy tắc theo hạng thành viên và danh mục bắp nước.',
      to: '/admin/promotions',
      icon: Tag,
      status: 'soon',
   },
   {
      title: 'Cộng đồng & blog',
      description: 'Bài viết điện ảnh và kiểm duyệt đánh giá, bình luận.',
      to: '/admin/community',
      icon: MessagesSquare,
      status: 'soon',
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
   const movieSummaryQuery: UseQueryResult<PageResponse<Movie>> = useQuery<PageResponse<Movie>>({
      queryKey: ADMIN_MOVIE_SUMMARY_KEY,
      queryFn: () => searchAdminMovies({ deleted: false, page: 0, size: 1 }),
   });

   const roleLabel: string = user ? getPrimaryRoleLabel(user) : 'Quản trị';
   const statCardItems: StatCardItem[] = [
      {
         label: 'Người dùng',
         value: formatCount(userSummaryQuery.isPending, userSummaryQuery.isError, userSummaryQuery.data?.totalElements),
         to: '/admin/users',
         icon: Users,
      },
      {
         label: 'Cụm rạp',
         value: formatCount(cinemaOptionsQuery.isPending, cinemaOptionsQuery.isError, cinemaOptionsQuery.data?.length),
         to: '/admin/cinemas',
         icon: Building2,
      },
      {
         label: 'Phim',
         value: formatCount(
            movieSummaryQuery.isPending,
            movieSummaryQuery.isError,
            movieSummaryQuery.data?.totalElements,
         ),
         to: '/admin/movies',
         icon: Clapperboard,
      },
   ];

   return (
      <div className="w-full max-w-7xl space-y-5">
         <PageHeader
            title="Tổng quan"
            description={`Xin chào ${user?.fullName ?? 'bạn'} · ${roleLabel} · ${
               isAdmin ? 'phạm vi toàn hệ thống' : 'phạm vi theo chi nhánh phụ trách'
            }`}
            actions={
               <>
                  <LinkButton
                     to="/admin/users/new"
                     variant="secondary"
                     icon={<UserPlus className="size-4" aria-hidden="true" />}
                  >
                     Thêm nhân viên
                  </LinkButton>
                  <LinkButton to="/admin/showtimes" icon={<CalendarClock className="size-4" aria-hidden="true" />}>
                     Xếp lịch chiếu
                  </LinkButton>
               </>
            }
         />

         <section aria-label="Số liệu chính" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCardItems.map((statCardItem) => (
               <Link
                  key={statCardItem.to}
                  to={statCardItem.to}
                  className="group flex items-center gap-4 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80 transition-colors hover:ring-brand-300"
               >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                     <statCardItem.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                     <p className="text-[13px] font-medium text-ink-500">{statCardItem.label}</p>
                     <p className="text-2xl font-semibold tracking-tight text-ink-900">{statCardItem.value}</p>
                  </div>
               </Link>
            ))}
            <Link
               to="/profile"
               className="group flex items-center gap-4 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80 transition-colors hover:ring-brand-300"
            >
               <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <ShieldCheck className="size-5" aria-hidden="true" />
               </span>
               <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink-500">Quyền hạn</p>
                  <p className="truncate text-base font-semibold text-ink-900">{roleLabel}</p>
               </div>
            </Link>
         </section>

         <section aria-label="Phân hệ quản trị" className="rounded-lg bg-white shadow-card ring-1 ring-ink-200/80">
            <div className="border-b border-ink-100 px-5 py-3.5">
               <h2 className="text-[15px] font-semibold text-ink-900">Phân hệ quản trị</h2>
            </div>
            <ul className="divide-y divide-ink-100">
               {ADMIN_MODULE_ITEMS.map((adminModuleItem) => (
                  <li key={adminModuleItem.to}>
                     <Link
                        to={adminModuleItem.to}
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-50"
                     >
                        <span
                           className={cn(
                              'grid size-9 shrink-0 place-items-center rounded-lg',
                              adminModuleItem.status === 'ready'
                                 ? 'bg-brand-50 text-brand-600'
                                 : 'bg-ink-100 text-ink-500',
                           )}
                        >
                           <adminModuleItem.icon className="size-[18px]" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                           <p className="text-sm font-semibold text-ink-900">{adminModuleItem.title}</p>
                           <p className="truncate text-[13px] text-ink-500">{adminModuleItem.description}</p>
                        </div>
                        <span
                           className={cn(
                              'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold',
                              adminModuleItem.status === 'ready'
                                 ? 'bg-emerald-50 text-emerald-700'
                                 : 'bg-ink-100 text-ink-600',
                           )}
                        >
                           {adminModuleItem.status === 'ready' ? 'Đang hoạt động' : 'Sắp ra mắt'}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-ink-300" aria-hidden="true" />
                     </Link>
                  </li>
               ))}
            </ul>
         </section>
      </div>
   );
}

export default AdminDashboardPage;
