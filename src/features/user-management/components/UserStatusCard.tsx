import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Lock, LockOpen } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { updateUserStatus } from '@/api/adminUserApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import type { AdminUser, UpdateUserStatusRequest } from '@/types/auth/admin';
import { useAdminUserRefresh } from '../hooks/useAdminUserRefresh';
import StatusBadge from './StatusBadge';

interface UserStatusCardProps {
   adminUser: AdminUser;
   isSelf: boolean;
}

export function UserStatusCard({ adminUser, isSelf }: UserStatusCardProps): ReactElement {
   const [isConfirmingLock, setIsConfirmingLock] = useState<boolean>(false);
   const refreshAdminUser: () => void = useAdminUserRefresh(adminUser.id);

   function handleStatusUpdated(): void {
      setIsConfirmingLock(false);
      refreshAdminUser();
   }

   const statusMutation: UseMutationResult<AdminUser, unknown, UpdateUserStatusRequest> = useMutation<
      AdminUser,
      unknown,
      UpdateUserStatusRequest
   >({
      mutationFn: (updateUserStatusRequest) => updateUserStatus(adminUser.id, updateUserStatusRequest),
      onSuccess: handleStatusUpdated,
   });

   const canLock: boolean = adminUser.status === 'ACTIVE' || adminUser.status === 'LOCKED';
   const canUnlock: boolean = adminUser.status === 'SUSPENDED' || adminUser.status === 'LOCKED';

   return (
      <div className="space-y-5">
         {statusMutation.isError && <Alert variant="error">{getErrorMessage(statusMutation.error)}</Alert>}
         <div className="flex items-center gap-3 text-sm text-ink-700">
            Trạng thái hiện tại: <StatusBadge userStatus={adminUser.status} />
         </div>
         {adminUser.status === 'DELETED' && <Alert variant="info">Tài khoản đã bị xóa và không thể thay đổi.</Alert>}
         {isSelf && <Alert variant="info">Bạn không thể tự khóa tài khoản của chính mình.</Alert>}
         {!isSelf && (canLock || canUnlock) && (
            <div className="flex flex-wrap gap-3">
               {canUnlock && (
                  <Button
                     isLoading={statusMutation.isPending}
                     icon={<LockOpen className="size-4" aria-hidden="true" />}
                     onClick={() => statusMutation.mutate({ status: 'ACTIVE' })}
                  >
                     Mở khóa tài khoản
                  </Button>
               )}
               {canLock && !isConfirmingLock && (
                  <Button
                     variant="secondary"
                     icon={<Lock className="size-4" aria-hidden="true" />}
                     onClick={() => setIsConfirmingLock(true)}
                  >
                     Khóa tài khoản
                  </Button>
               )}
               {canLock && isConfirmingLock && (
                  <>
                     <Button
                        isLoading={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ status: 'SUSPENDED' })}
                     >
                        Xác nhận khóa
                     </Button>
                     <Button variant="ghost" onClick={() => setIsConfirmingLock(false)}>
                        Hủy
                     </Button>
                  </>
               )}
            </div>
         )}
         <p className="text-xs text-ink-500">Khóa tài khoản sẽ đăng xuất người dùng khỏi mọi thiết bị.</p>
      </div>
   );
}

export default UserStatusCard;
