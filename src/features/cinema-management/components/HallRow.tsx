import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Armchair, Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { deleteHall } from '@/api/hallApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/apiError';
import type { Hall } from '@/types/cinema';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import CinemaStatusBadge from './CinemaStatusBadge';

interface HallRowProps {
   hall: Hall;
   onEdit: (hallId: number) => void;
}

export function HallRow({ hall, onEdit }: HallRowProps): ReactElement {
   const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
   const refreshCinema: () => void = useCinemaRefresh(hall.cinemaId);

   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deleteHall(hall.id),
      onSuccess: refreshCinema,
   });

   return (
      <li className="space-y-3 rounded-2xl border border-ink-100 px-4 py-4">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
               <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                  {hall.name}
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-700">
                     {hall.screenType}
                  </span>
                  <CinemaStatusBadge hallStatus={hall.status} />
               </p>
               <p className="mt-0.5 text-xs text-ink-500">{hall.totalSeats} ghế</p>
            </div>
            <div className="flex flex-wrap gap-2">
               <Link
                  to={`/admin/halls/${hall.id}/seat-map`}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-50 px-3 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 transition-colors hover:bg-brand-100"
               >
                  <Armchair className="size-4" aria-hidden="true" />
                  Sơ đồ ghế
               </Link>
               <Button
                  variant="secondary"
                  className="h-9 px-3"
                  icon={<Pencil className="size-4" aria-hidden="true" />}
                  onClick={() => onEdit(hall.id)}
               >
                  Sửa
               </Button>
               {!isConfirmingDelete && (
                  <Button
                     variant="secondary"
                     className="h-9 px-3"
                     icon={<Trash2 className="size-4" aria-hidden="true" />}
                     onClick={() => setIsConfirmingDelete(true)}
                  >
                     Xóa
                  </Button>
               )}
            </div>
         </div>
         {isConfirmingDelete && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
               <span className="font-medium">Xóa phòng chiếu này cùng toàn bộ sơ đồ ghế?</span>
               <Button
                  className="h-9 px-4"
                  isLoading={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
               >
                  Xác nhận xóa
               </Button>
               <Button variant="ghost" className="h-9 px-4" onClick={() => setIsConfirmingDelete(false)}>
                  Hủy
               </Button>
            </div>
         )}
         {deleteMutation.isError && <Alert variant="error">{getErrorMessage(deleteMutation.error)}</Alert>}
      </li>
   );
}

export default HallRow;
