import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import type { ReactElement } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/apiError';

interface RestoreButtonProps {
   restore: () => Promise<unknown>;
   onRestored: () => void;
}

export function RestoreButton({ restore, onRestored }: RestoreButtonProps): ReactElement {
   const restoreMutation: UseMutationResult<unknown, unknown, void> = useMutation<unknown, unknown, void>({
      mutationFn: restore,
      onSuccess: onRestored,
   });

   return (
      <div className="space-y-2">
         <Button
            variant="secondary"
            className="h-9 px-3"
            isLoading={restoreMutation.isPending}
            icon={<RotateCcw className="size-4" aria-hidden="true" />}
            onClick={() => restoreMutation.mutate()}
         >
            Khôi phục
         </Button>
         {restoreMutation.isError && <Alert variant="error">{getErrorMessage(restoreMutation.error)}</Alert>}
      </div>
   );
}

export default RestoreButton;
