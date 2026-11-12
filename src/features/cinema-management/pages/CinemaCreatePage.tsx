import { useMutation, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router-dom';
import { createCinema } from '@/api/cinema/cinemaApi';
import SectionCard from '@/components/common/SectionCard';
import { getErrorMessage, getFieldErrors } from '@/lib/common/apiError';
import type { CinemaDetail, CinemaRequest, Facility } from '@/types/cinema/cinema';
import CinemaForm from '../components/CinemaForm';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import { useFacilities } from '../hooks/useFacilities';

export function CinemaCreatePage(): ReactElement {
   const navigate: NavigateFunction = useNavigate();
   const refreshCinema: () => void = useCinemaRefresh(null);
   const facilitiesQuery: UseQueryResult<Facility[]> = useFacilities();

   function handleCreated(cinemaDetail: CinemaDetail): void {
      refreshCinema();
      navigate(`/admin/cinemas/${cinemaDetail.id}`, { replace: true });
   }

   const createMutation: UseMutationResult<CinemaDetail, unknown, CinemaRequest> = useMutation<
      CinemaDetail,
      unknown,
      CinemaRequest
   >({
      mutationFn: createCinema,
      onSuccess: handleCreated,
   });

   const serverFieldErrors: Record<string, string> = createMutation.isError ? getFieldErrors(createMutation.error) : {};
   const hasFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   return (
      <div className="w-full max-w-3xl space-y-6">
         <Link to="/admin/cinemas" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về danh sách cụm rạp
         </Link>
         <h1 className="text-xl font-semibold tracking-tight text-ink-900">Thêm cụm rạp</h1>
         <SectionCard title="Thông tin cụm rạp" description="Sau khi tạo, bạn có thể thêm phòng chiếu và sơ đồ ghế.">
            <CinemaForm
               facilities={facilitiesQuery.data ?? []}
               canEditStatus
               isSubmitting={createMutation.isPending}
               submitLabel="Tạo cụm rạp"
               errorMessage={
                  createMutation.isError && !hasFieldErrors ? getErrorMessage(createMutation.error) : undefined
               }
               serverFieldErrors={serverFieldErrors}
               onSubmit={(cinemaRequest) => createMutation.mutate(cinemaRequest)}
            />
         </SectionCard>
      </div>
   );
}

export default CinemaCreatePage;
