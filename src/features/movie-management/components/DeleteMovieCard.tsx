import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { deleteMovie } from '@/api/movie/movieApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { useMovieRefresh } from '../hooks/useMovieRefresh';

interface DeleteMovieCardProps {
   movieId: number;
}

export function DeleteMovieCard({ movieId }: DeleteMovieCardProps): ReactElement {
   const [isConfirming, setIsConfirming] = useState<boolean>(false);
   const navigate: NavigateFunction = useNavigate();
   const refreshMovie: () => void = useMovieRefresh(null);

   function handleDeleted(): void {
      refreshMovie();
      navigate('/admin/movies', { replace: true });
   }

   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deleteMovie(movieId),
      onSuccess: handleDeleted,
   });

   return (
      <div className="space-y-5">
         {deleteMutation.isError && <Alert variant="error">{getErrorMessage(deleteMutation.error)}</Alert>}
         <p className="text-sm text-ink-600">
            Phim bị xóa mềm: ẩn khỏi danh sách và trang khách hàng nhưng dữ liệu vẫn được giữ lại, có thể khôi phục
            trong bộ lọc «Đã xóa». Không thể xóa khi phim còn suất chiếu chưa diễn ra.
         </p>
         {!isConfirming ? (
            <Button
               variant="secondary"
               icon={<Trash2 className="size-4" aria-hidden="true" />}
               onClick={() => setIsConfirming(true)}
            >
               Xóa phim
            </Button>
         ) : (
            <div className="flex flex-wrap gap-3">
               <Button isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                  Xác nhận xóa
               </Button>
               <Button variant="ghost" onClick={() => setIsConfirming(false)}>
                  Hủy
               </Button>
            </div>
         )}
      </div>
   );
}

export default DeleteMovieCard;
