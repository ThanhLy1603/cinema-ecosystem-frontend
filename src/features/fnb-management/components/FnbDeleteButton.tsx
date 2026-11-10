import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';

interface FnbDeleteButtonProps {
   confirmMessage: string;
   remove: () => Promise<void>;
   onDeleted: () => void;
}

export function FnbDeleteButton({ confirmMessage, remove, onDeleted }: FnbDeleteButtonProps): ReactElement {
   const [isConfirming, setIsConfirming] = useState<boolean>(false);
   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: remove,
      onSuccess: onDeleted,
   });

   if (!isConfirming) {
      return (
         <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 className="size-3.5" aria-hidden="true" />}
            onClick={() => setIsConfirming(true)}
         >
            Xóa
         </Button>
      );
   }

   return (
      <div className="space-y-2 text-left">
         <p className="max-w-[220px] text-[13px] font-medium text-danger-800">{confirmMessage}</p>
         <div className="flex gap-2">
            <Button size="sm" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
               Xác nhận
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsConfirming(false)}>
               Hủy
            </Button>
         </div>
         {deleteMutation.isError && <Alert variant="error">{getErrorMessage(deleteMutation.error)}</Alert>}
      </div>
   );
}

export default FnbDeleteButton;
