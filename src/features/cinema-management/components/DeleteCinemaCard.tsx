import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { deleteCinema } from '@/api/cinemaApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';

interface DeleteCinemaCardProps {
   cinemaId: number;
}

export function DeleteCinemaCard({ cinemaId }: DeleteCinemaCardProps): ReactElement {
   const [isConfirming, setIsConfirming] = useState<boolean>(false);
   const navigate: NavigateFunction = useNavigate();
   const refreshCinema: () => void = useCinemaRefresh(null);

   function handleDeleted(): void {
      refreshCinema();
      navigate('/admin/cinemas', { replace: true });
   }

   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deleteCinema(cinemaId),
      onSuccess: handleDeleted,
   });

   return (
      <div className="space-y-5">
         {deleteMutation.isError && <Alert variant="error">{getErrorMessage(deleteMutation.error)}</Alert>}
         <p className="text-sm text-ink-600">
            Cụm rạp bị xóa mềm: ẩn khỏi danh sách và trang khách hàng nhưng dữ liệu vẫn được giữ lại, có thể khôi phục
            trong bộ lọc «Đã xóa». Không thể xóa khi còn suất chiếu chưa diễn ra.
         </p>
         {!isConfirming ? (
            <Button
               variant="secondary"
               icon={<Trash2 className="size-4" aria-hidden="true" />}
               onClick={() => setIsConfirming(true)}
            >
               Xóa cụm rạp
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

export default DeleteCinemaCard;
