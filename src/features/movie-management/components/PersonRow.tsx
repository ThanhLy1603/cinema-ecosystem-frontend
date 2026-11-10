import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Pencil, Trash2, UserRound } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { deletePerson } from '@/api/movieApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/apiError';
import type { Person } from '@/types/movie';
import { ADMIN_PERSONS_KEY, PERSON_OPTIONS_KEY } from '../utils/queryKeys';

interface PersonRowProps {
   person: Person;
   canDelete: boolean;
   onEdit: (personId: number) => void;
}

export function PersonRow({ person, canDelete, onEdit }: PersonRowProps): ReactElement {
   const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
   const queryClient: QueryClient = useQueryClient();

   function handleDeleted(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PERSONS_KEY });
      void queryClient.invalidateQueries({ queryKey: PERSON_OPTIONS_KEY });
   }

   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deletePerson(person.id),
      onSuccess: handleDeleted,
   });

   return (
      <li className="space-y-3 rounded-2xl border border-ink-100 px-4 py-4">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
               {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
               ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-400">
                     <UserRound className="size-5" aria-hidden="true" />
                  </span>
               )}
               <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{person.name}</p>
                  {person.bio && <p className="truncate text-xs text-ink-500">{person.bio}</p>}
               </div>
            </div>
            {!isConfirmingDelete && (
               <div className="flex gap-2">
                  <Button
                     variant="secondary"
                     className="h-9 px-3"
                     icon={<Pencil className="size-4" aria-hidden="true" />}
                     onClick={() => onEdit(person.id)}
                  >
                     Sửa
                  </Button>
                  {canDelete && (
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
            )}
         </div>
         {isConfirmingDelete && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-800">
               <span className="font-medium">Xóa vĩnh viễn nghệ sĩ này? Chỉ xóa được khi chưa tham gia phim nào.</span>
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

export default PersonRow;
