import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAdminCinema, updateCinema } from '@/api/cinema/cinemaApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import SectionCard from '@/components/common/SectionCard';
import Alert from '@/components/ui/Alert';
import { getErrorMessage, getFieldErrors } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CinemaDetail, CinemaRequest, Facility } from '@/types/cinema/cinema';
import CinemaForm from '../components/CinemaForm';
import CinemaStatusBadge from '../components/CinemaStatusBadge';
import DeleteCinemaCard from '../components/DeleteCinemaCard';
import HallSection from '../components/HallSection';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import { useFacilities } from '../hooks/useFacilities';
import { adminCinemaDetailKey } from '../utils/queryKeys';

export function CinemaDetailPage(): ReactElement {
   const { cinemaId: cinemaIdParam } = useParams<{ cinemaId: string }>();
   const cinemaId: number = Number(cinemaIdParam);
   const isValidCinemaId: boolean = Number.isInteger(cinemaId) && cinemaId > 0;
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const refreshCinema: () => void = useCinemaRefresh(isValidCinemaId ? cinemaId : null);
   const facilitiesQuery: UseQueryResult<Facility[]> = useFacilities();
   const cinemaQuery: UseQueryResult<CinemaDetail> = useQuery<CinemaDetail>({
      queryKey: adminCinemaDetailKey(cinemaId),
      queryFn: () => getAdminCinema(cinemaId),
      enabled: isValidCinemaId,
   });

   const updateMutation: UseMutationResult<CinemaDetail, unknown, CinemaRequest> = useMutation<
      CinemaDetail,
      unknown,
      CinemaRequest
   >({
      mutationFn: (cinemaRequest) => updateCinema(cinemaId, cinemaRequest),
      onSuccess: refreshCinema,
   });

   function handleSubmit(cinemaRequest: CinemaRequest): void {
      updateMutation.reset();
      updateMutation.mutate(cinemaRequest);
   }

   const backLink: ReactElement = (
      <Link to="/admin/cinemas" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Về danh sách cụm rạp
      </Link>
   );

   if (!isValidCinemaId) {
      return (
         <div className="w-full max-w-3xl space-y-4">
            <Alert variant="error">Mã cụm rạp không hợp lệ.</Alert>
            {backLink}
         </div>
      );
   }
   if (cinemaQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (cinemaQuery.isError) {
      return (
         <div className="w-full max-w-3xl space-y-4">
            <Alert variant="error">{getErrorMessage(cinemaQuery.error)}</Alert>
            {backLink}
         </div>
      );
   }

   const cinemaDetail: CinemaDetail = cinemaQuery.data;
   const serverFieldErrors: Record<string, string> = updateMutation.isError ? getFieldErrors(updateMutation.error) : {};
   const hasFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   return (
      <div className="w-full max-w-4xl space-y-6">
         {backLink}
         <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
               <h1 className="text-xl font-semibold tracking-tight text-ink-900">{cinemaDetail.name}</h1>
               <CinemaStatusBadge cinemaStatus={cinemaDetail.status} />
            </div>
            {cinemaDetail.status === 'ACTIVE' && (
               <Link
                  to={`/cinemas/${cinemaDetail.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
               >
                  Xem trang khách hàng
                  <ExternalLink className="size-4" aria-hidden="true" />
               </Link>
            )}
         </header>

         <SectionCard title="Thông tin cụm rạp">
            <CinemaForm
               key={`${cinemaDetail.id}-${cinemaDetail.name}-${cinemaDetail.status}`}
               initialCinema={cinemaDetail}
               facilities={facilitiesQuery.data ?? []}
               canEditStatus={isAdmin}
               isSubmitting={updateMutation.isPending}
               submitLabel="Lưu thay đổi"
               errorMessage={
                  updateMutation.isError && !hasFieldErrors ? getErrorMessage(updateMutation.error) : undefined
               }
               successMessage={updateMutation.isSuccess ? 'Đã cập nhật thông tin cụm rạp.' : undefined}
               serverFieldErrors={serverFieldErrors}
               onSubmit={handleSubmit}
            />
         </SectionCard>

         <SectionCard title="Phòng chiếu" description="Thêm phòng chiếu rồi thiết kế sơ đồ ghế cho từng phòng.">
            <HallSection cinemaId={cinemaDetail.id} halls={cinemaDetail.halls} />
         </SectionCard>

         {isAdmin && (
            <SectionCard title="Xóa cụm rạp">
               <DeleteCinemaCard cinemaId={cinemaDetail.id} />
            </SectionCard>
         )}
      </div>
   );
}

export default CinemaDetailPage;
