import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { listHalls, restoreHall } from '@/api/hallApi';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import type { Hall } from '@/types/cinema/cinema';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import { adminDeletedHallsKey } from '../utils/queryKeys';
import RestoreButton from '@/components/common/RestoreButton';

interface DeletedHallListProps {
   cinemaId: number;
}

export function DeletedHallList({ cinemaId }: DeletedHallListProps): ReactElement {
   const refreshCinema: () => void = useCinemaRefresh(cinemaId);
   const deletedHallsQuery: UseQueryResult<Hall[]> = useQuery<Hall[]>({
      queryKey: adminDeletedHallsKey(cinemaId),
      queryFn: () => listHalls(cinemaId, true),
   });

   if (deletedHallsQuery.isError) {
      return <Alert variant="error">{getErrorMessage(deletedHallsQuery.error)}</Alert>;
   }
   if (deletedHallsQuery.isPending) {
      return <p className="text-sm text-ink-500">Đang tải phòng đã xóa...</p>;
   }
   if (deletedHallsQuery.data.length === 0) {
      return (
         <p className="rounded-2xl bg-ink-50 px-4 py-4 text-center text-sm text-ink-500">
            Không có phòng chiếu nào đã xóa.
         </p>
      );
   }

   return (
      <ul className="space-y-3">
         {deletedHallsQuery.data.map((hall) => (
            <li
               key={hall.id}
               className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ink-200 bg-ink-50/60 px-4 py-3"
            >
               <div>
                  <p className="font-semibold text-ink-700">
                     {hall.name}
                     <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-600">
                        {hall.screenType}
                     </span>
                  </p>
                  <p className="text-xs text-ink-500">{hall.totalSeats} ghế · đã xóa</p>
               </div>
               <RestoreButton restore={() => restoreHall(hall.id)} onRestored={refreshCinema} />
            </li>
         ))}
      </ul>
   );
}

export default DeletedHallList;
