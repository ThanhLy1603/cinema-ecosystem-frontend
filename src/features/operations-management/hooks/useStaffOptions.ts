import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { searchUsers } from '@/api/auth/adminUserApi';
import type { SelectOption } from '@/components/ui/SelectField';
import type { AdminUser } from '@/types/auth/admin';
import type { PageResponse } from '@/types/common/api';

const STAFF_OPTIONS_PAGE_SIZE: number = 100;
const STAFF_OPTIONS_STALE_TIME_MS: number = 5 * 60 * 1000;

export function useStaffOptions(cinemaId: string): SelectOption[] {
   const staffUsersQuery: UseQueryResult<PageResponse<AdminUser>> = useQuery<PageResponse<AdminUser>>({
      queryKey: ['operations', 'staff-options', cinemaId],
      queryFn: () =>
         searchUsers({
            role: 'ROLE_STAFF',
            cinemaId: cinemaId ? Number(cinemaId) : undefined,
            page: 0,
            size: STAFF_OPTIONS_PAGE_SIZE,
         }),
      staleTime: STAFF_OPTIONS_STALE_TIME_MS,
   });
   return (staffUsersQuery.data?.content ?? []).map((adminUser: AdminUser): SelectOption => ({
      value: String(adminUser.id),
      label: adminUser.fullName,
   }));
}
