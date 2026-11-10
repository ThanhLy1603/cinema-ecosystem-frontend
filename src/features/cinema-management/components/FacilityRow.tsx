import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { deleteFacility, restoreFacility } from '@/api/cinemaApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { PUBLIC_CINEMAS_KEY } from '@/lib/cinema/cinemaQueryKeys';
import type { Facility } from '@/types/cinema/cinema';
import { ADMIN_CINEMA_LIST_KEY, ADMIN_FACILITIES_KEY } from '../utils/queryKeys';
import RestoreButton from '@/components/common/RestoreButton';

interface FacilityRowProps {
   facility: Facility;
   canManage: boolean;
   onEdit: (facilityId: number) => void;
}

export function FacilityRow({ facility, canManage, onEdit }: FacilityRowProps): ReactElement {
   const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
   const queryClient: QueryClient = useQueryClient();

   function handleDeleted(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_FACILITIES_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_CINEMA_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_CINEMAS_KEY });
   }

   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deleteFacility(facility.id),
      onSuccess: handleDeleted,
   });

   return (
      <li className="space-y-3 rounded-2xl border border-ink-100 px-4 py-4">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
               {facility.iconUrl ? (
                  <img src={facility.iconUrl} alt="" className="size-9 shrink-0 rounded-lg object-contain" />
               ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-bold text-ink-500">
                     {facility.name.charAt(0).toUpperCase()}
                  </span>
               )}
               <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{facility.name}</p>
                  {facility.description && <p className="truncate text-xs text-ink-500">{facility.description}</p>}
               </div>
            </div>
            {canManage && facility.deleted && (
               <RestoreButton restore={() => restoreFacility(facility.id)} onRestored={handleDeleted} />
            )}
            {canManage && !facility.deleted && !isConfirmingDelete && (
               <div className="flex gap-2">
                  <Button
                     variant="secondary"
                     className="h-9 px-3"
                     icon={<Pencil className="size-4" aria-hidden="true" />}
                     onClick={() => onEdit(facility.id)}
                  >
                     Sửa
                  </Button>
                  <Button
                     variant="secondary"
                     className="h-9 px-3"
                     icon={<Trash2 className="size-4" aria-hidden="true" />}
                     onClick={() => setIsConfirmingDelete(true)}
                  >
                     Xóa
                  </Button>
               </div>
            )}
         </div>
         {isConfirmingDelete && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-800">
               <span className="font-medium">
                  Xóa tiện ích này? Tiện ích sẽ ẩn khỏi các cụm rạp và có thể khôi phục sau.
               </span>
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

export default FacilityRow;
