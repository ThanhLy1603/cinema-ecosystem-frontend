import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { deleteGenre } from '@/api/movieApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { PUBLIC_MOVIES_KEY } from '@/lib/movie/movieQueryKeys';
import type { Genre } from '@/types/movie/movie';
import { ADMIN_GENRES_KEY } from '../utils/queryKeys';

interface GenreRowProps {
   genre: Genre;
   canDelete: boolean;
   onEdit: (genreId: number) => void;
}

export function GenreRow({ genre, canDelete, onEdit }: GenreRowProps): ReactElement {
   const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
   const queryClient: QueryClient = useQueryClient();

   function handleDeleted(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_MOVIES_KEY });
   }

   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deleteGenre(genre.id),
      onSuccess: handleDeleted,
   });

   return (
      <li className="space-y-3 rounded-2xl border border-ink-100 px-4 py-4">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
               <p className="truncate font-semibold text-ink-900">{genre.name}</p>
               <p className="truncate text-xs text-ink-500">/{genre.slug}</p>
            </div>
            {!isConfirmingDelete && (
               <div className="flex gap-2">
                  <Button
                     variant="secondary"
                     className="h-9 px-3"
                     icon={<Pencil className="size-4" aria-hidden="true" />}
                     onClick={() => onEdit(genre.id)}
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
               <span className="font-medium">Xóa vĩnh viễn thể loại này? Chỉ xóa được khi chưa gán cho phim nào.</span>
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

export default GenreRow;
