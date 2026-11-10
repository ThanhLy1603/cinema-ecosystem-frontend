import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { searchUsers } from '@/api/adminUserApi';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import LinkButton from '@/components/ui/LinkButton';
import { getErrorMessage } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AdminUser, UserSearchParams, UserStatus } from '@/types/auth/admin';
import type { PageResponse } from '@/types/common/api';
import type { UserRole } from '@/types/auth/auth';
import type { CinemaOption } from '@/types/cinema/cinema';
import UserFilterBar, { type UserFilters } from '../components/UserFilterBar';
import UserTable from '../components/UserTable';
import { useCinemaOptions } from '../hooks/useCinemaOptions';
import { ADMIN_USER_LIST_KEY } from '../utils/queryKeys';

const PAGE_SIZE: number = 20;
const EMPTY_FILTERS: UserFilters = { search: '', role: '', status: '', cinemaId: '' };

function toSearchParams(userFilters: UserFilters, page: number): UserSearchParams {
   return {
      search: userFilters.search || undefined,
      role: (userFilters.role || undefined) as UserRole | undefined,
      status: (userFilters.status || undefined) as UserStatus | undefined,
      cinemaId: userFilters.cinemaId ? Number(userFilters.cinemaId) : undefined,
      page,
      size: PAGE_SIZE,
   };
}

export function UserManagementPage(): ReactElement {
   const [userFilters, setUserFilters] = useState<UserFilters>(EMPTY_FILTERS);
   const [page, setPage] = useState<number>(0);
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const cinemaOptionsQuery: UseQueryResult<CinemaOption[]> = useCinemaOptions();
   const userSearchParams: UserSearchParams = toSearchParams(userFilters, page);
   const usersQuery: UseQueryResult<PageResponse<AdminUser>> = useQuery<PageResponse<AdminUser>>({
      queryKey: [...ADMIN_USER_LIST_KEY, userSearchParams],
      queryFn: () => searchUsers(userSearchParams),
      placeholderData: keepPreviousData,
   });

   function handleFiltersChange(nextUserFilters: UserFilters): void {
      setUserFilters(nextUserFilters);
      setPage(0);
   }

   return (
      <div className="w-full max-w-7xl space-y-5">
         <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
               <h1 className="text-xl font-semibold tracking-tight text-ink-900">Quản lý người dùng</h1>
               <p className="mt-1 text-sm text-ink-500">
                  {isAdmin ? 'Toàn bộ tài khoản trong hệ thống.' : 'Nhân viên thuộc các chi nhánh bạn phụ trách.'}
               </p>
            </div>
            <LinkButton to="/admin/users/new" icon={<UserPlus className="size-4" aria-hidden="true" />}>
               Thêm nhân viên
            </LinkButton>
         </header>

         <UserFilterBar
            userFilters={userFilters}
            isAdmin={isAdmin}
            cinemaOptions={cinemaOptionsQuery.data ?? []}
            onChange={handleFiltersChange}
         />

         {usersQuery.isError && <Alert variant="error">{getErrorMessage(usersQuery.error)}</Alert>}
         {usersQuery.data && (
            <>
               <UserTable adminUsers={usersQuery.data.content} />
               <Pagination
                  page={usersQuery.data.page}
                  totalPages={usersQuery.data.totalPages}
                  totalElements={usersQuery.data.totalElements}
                  onPageChange={setPage}
               />
            </>
         )}
         {usersQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách...</p>}
      </div>
   );
}

export default UserManagementPage;
