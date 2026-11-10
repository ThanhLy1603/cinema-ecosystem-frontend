import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSeatMap } from '@/api/hallApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { useSeatTypes } from '@/lib/cinema/useSeatTypes';
import type { SeatLayout, SeatType } from '@/types/cinema/cinema';
import CinemaStatusBadge from '../components/CinemaStatusBadge';
import SeatMapEditor from '../components/SeatMapEditor';
import { adminSeatMapKey } from '../utils/queryKeys';

export function SeatMapEditorPage(): ReactElement {
   const { hallId: hallIdParam } = useParams<{ hallId: string }>();
   const hallId: number = Number(hallIdParam);
   const isValidHallId: boolean = Number.isInteger(hallId) && hallId > 0;
   const seatTypesQuery: UseQueryResult<SeatType[]> = useSeatTypes();
   const seatMapQuery: UseQueryResult<SeatLayout> = useQuery<SeatLayout>({
      queryKey: adminSeatMapKey(hallId),
      queryFn: () => getSeatMap(hallId),
      enabled: isValidHallId,
      gcTime: 0,
      staleTime: 0,
   });

   if (!isValidHallId) {
      return (
         <div className="w-full max-w-3xl space-y-4">
            <Alert variant="error">Mã phòng chiếu không hợp lệ.</Alert>
            <Link to="/admin/cinemas" className="text-sm font-semibold text-brand-700">
               Về danh sách cụm rạp
            </Link>
         </div>
      );
   }
   if (seatMapQuery.isPending || seatTypesQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (seatMapQuery.isError || seatTypesQuery.isError) {
      return (
         <div className="w-full max-w-3xl space-y-4">
            <Alert variant="error">{getErrorMessage(seatMapQuery.error ?? seatTypesQuery.error)}</Alert>
            <Link to="/admin/cinemas" className="text-sm font-semibold text-brand-700">
               Về danh sách cụm rạp
            </Link>
         </div>
      );
   }

   const seatLayout: SeatLayout = seatMapQuery.data;

   return (
      <div className="w-full max-w-6xl space-y-6">
         <Link
            to={`/admin/cinemas/${seatLayout.cinemaId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
         >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về cụm rạp
         </Link>
         <header className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-ink-900">Sơ đồ ghế · {seatLayout.hallName}</h1>
            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">
               {seatLayout.screenType}
            </span>
            <CinemaStatusBadge hallStatus={seatLayout.hallStatus} />
         </header>
         <SeatMapEditor seatLayout={seatLayout} seatTypes={seatTypesQuery.data} />
      </div>
   );
}

export default SeatMapEditorPage;
