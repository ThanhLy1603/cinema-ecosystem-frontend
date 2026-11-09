import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicSeatLayout } from '@/api/cinemaApi';
import SeatGrid from '@/components/common/SeatGrid';
import SeatLegend from '@/components/common/SeatLegend';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/apiError';
import { publicSeatLayoutKey } from '@/lib/cinemaQueryKeys';
import { getLayoutRowLetters } from '@/lib/seatMap';
import { useSeatTypes } from '@/lib/useSeatTypes';
import type { SeatLayout, SeatType } from '@/types/cinema';

interface HallSeatPreviewProps {
   hallId: number;
}

function countSeatsByType(seatLayout: SeatLayout, seatType: SeatType): number {
   return seatLayout.seats.filter((seatLayoutSeat) => seatLayoutSeat.type === seatType.code).length;
}

export function HallSeatPreview({ hallId }: HallSeatPreviewProps): ReactElement {
   const seatTypesQuery: UseQueryResult<SeatType[]> = useSeatTypes();
   const seatLayoutQuery: UseQueryResult<SeatLayout> = useQuery<SeatLayout>({
      queryKey: publicSeatLayoutKey(hallId),
      queryFn: () => getPublicSeatLayout(hallId),
   });

   if (seatLayoutQuery.isError) {
      return <Alert variant="error">{getErrorMessage(seatLayoutQuery.error)}</Alert>;
   }
   if (seatLayoutQuery.isPending || seatTypesQuery.isPending) {
      return <p className="py-10 text-center text-sm text-ink-500">Đang tải sơ đồ ghế...</p>;
   }

   const seatLayout: SeatLayout = seatLayoutQuery.data;
   const seatTypes: SeatType[] = seatTypesQuery.data ?? [];

   if (seatLayout.seats.length === 0) {
      return <p className="py-10 text-center text-sm text-ink-500">Phòng chiếu này chưa có sơ đồ ghế.</p>;
   }

   return (
      <div className="space-y-5">
         <SeatGrid
            rows={getLayoutRowLetters(seatLayout.rows)}
            columns={seatLayout.columns}
            seats={seatLayout.seats}
            ariaLabel={`Sơ đồ ghế ${seatLayout.hallName}`}
         />
         <SeatLegend
            seatTypes={seatTypes}
            showMaintenance={seatLayout.seats.some((seat) => seat.status === 'MAINTENANCE')}
         />
         <p className="text-center text-sm text-ink-500">
            Tổng <strong className="text-ink-900">{seatLayout.seats.length}</strong> ghế
            {seatTypes.map((seatType) => ` · ${countSeatsByType(seatLayout, seatType)} ${seatType.name.toLowerCase()}`)}
         </p>
      </div>
   );
}

export default HallSeatPreview;
