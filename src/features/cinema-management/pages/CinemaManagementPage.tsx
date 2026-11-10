import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ListChecks, Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { searchAdminCinemas } from '@/api/cinemaApi';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import LinkButton from '@/components/ui/LinkButton';
import { getErrorMessage } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PageResponse } from '@/types/common/api';
import type { Cinema, CinemaSearchParams, CinemaStatus } from '@/types/cinema/cinema';
import CinemaFilterBar, { type CinemaFilters } from '../components/CinemaFilterBar';
import CinemaTable from '../components/CinemaTable';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import { ADMIN_CINEMA_LIST_KEY } from '../utils/queryKeys';

const PAGE_SIZE: number = 20;
const EMPTY_FILTERS: CinemaFilters = { search: '', city: '', status: '', deleted: '' };

function toSearchParams(cinemaFilters: CinemaFilters, page: number): CinemaSearchParams {
   return {
      search: cinemaFilters.search || undefined,
      city: cinemaFilters.city || undefined,
      status: (cinemaFilters.status || undefined) as CinemaStatus | undefined,
      deleted: cinemaFilters.deleted === 'true',
      page,
      size: PAGE_SIZE,
   };
}

export function CinemaManagementPage(): ReactElement {
   const [cinemaFilters, setCinemaFilters] = useState<CinemaFilters>(EMPTY_FILTERS);
   const [page, setPage] = useState<number>(0);
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const cinemaSearchParams: CinemaSearchParams = toSearchParams(cinemaFilters, page);
   const cinemasQuery: UseQueryResult<PageResponse<Cinema>> = useQuery<PageResponse<Cinema>>({
      queryKey: [...ADMIN_CINEMA_LIST_KEY, cinemaSearchParams],
      queryFn: () => searchAdminCinemas(cinemaSearchParams),
      placeholderData: keepPreviousData,
   });

   const refreshCinemas: () => void = useCinemaRefresh(null);

   function handleFiltersChange(nextCinemaFilters: CinemaFilters): void {
      setCinemaFilters(nextCinemaFilters);
      setPage(0);
   }

   return (
      <div className="w-full max-w-7xl space-y-5">
         <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
               <h1 className="text-xl font-semibold tracking-tight text-ink-900">Quản lý cụm rạp</h1>
               <p className="mt-1 text-sm text-ink-500">
                  {isAdmin ? 'Toàn bộ cụm rạp trong hệ thống.' : 'Các cụm rạp bạn phụ trách.'}
               </p>
            </div>
            <div className="flex flex-wrap gap-3">
               <LinkButton
                  to="/admin/cinemas/facilities"
                  variant="secondary"
                  icon={<ListChecks className="size-4" aria-hidden="true" />}
               >
                  Danh mục tiện ích
               </LinkButton>
               {isAdmin && (
                  <LinkButton to="/admin/cinemas/new" icon={<Plus className="size-4" aria-hidden="true" />}>
                     Thêm cụm rạp
                  </LinkButton>
               )}
            </div>
         </header>

         <CinemaFilterBar cinemaFilters={cinemaFilters} isAdmin={isAdmin} onChange={handleFiltersChange} />

         {cinemasQuery.isError && <Alert variant="error">{getErrorMessage(cinemasQuery.error)}</Alert>}
         {cinemasQuery.data && (
            <>
               <CinemaTable cinemas={cinemasQuery.data.content} canRestore={isAdmin} onRestored={refreshCinemas} />
               <Pagination
                  page={cinemasQuery.data.page}
                  totalPages={cinemasQuery.data.totalPages}
                  totalElements={cinemasQuery.data.totalElements}
                  onPageChange={setPage}
               />
            </>
         )}
         {cinemasQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách...</p>}
      </div>
   );
}

export default CinemaManagementPage;
