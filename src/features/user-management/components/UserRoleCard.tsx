import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { updateUserRoles } from '@/api/adminUserApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import { getErrorMessage } from '@/lib/apiError';
import type { AdminUser, UpdateUserRolesRequest } from '@/types/admin';
import type { UserRole } from '@/types/auth';
import { useAdminUserRefresh } from '../hooks/useAdminUserRefresh';
import { ROLE_OPTIONS } from '../utils/labels';

interface UserRoleCardProps {
   adminUser: AdminUser;
   isSelf: boolean;
}

export function UserRoleCard({ adminUser, isSelf }: UserRoleCardProps): ReactElement {
   const currentRole: UserRole = adminUser.roles[0] ?? 'ROLE_CUSTOMER';
   const [selectedRole, setSelectedRole] = useState<string>(currentRole);
   const refreshAdminUser: () => void = useAdminUserRefresh(adminUser.id);

   const roleMutation: UseMutationResult<AdminUser, unknown, UpdateUserRolesRequest> = useMutation<
      AdminUser,
      unknown,
      UpdateUserRolesRequest
   >({
      mutationFn: (updateUserRolesRequest) => updateUserRoles(adminUser.id, updateUserRolesRequest),
      onSuccess: refreshAdminUser,
   });

   const isDisabled: boolean = isSelf || adminUser.status === 'DELETED';

   return (
      <div className="space-y-5">
         {roleMutation.isError && <Alert variant="error">{getErrorMessage(roleMutation.error)}</Alert>}
         {roleMutation.isSuccess && <Alert variant="success">Đã cập nhật role. Người dùng cần đăng nhập lại.</Alert>}
         {isSelf && <Alert variant="info">Bạn không thể tự đổi role của chính mình.</Alert>}
         <SelectField
            id="admin-user-role"
            label="Role"
            value={selectedRole}
            onChange={setSelectedRole}
            options={ROLE_OPTIONS}
            disabled={isDisabled}
            error={selectedRole === '' ? 'Vui lòng chọn role' : undefined}
         />
         <Button
            isLoading={roleMutation.isPending}
            disabled={isDisabled || selectedRole === '' || selectedRole === currentRole}
            icon={<Save className="size-4" aria-hidden="true" />}
            onClick={() => roleMutation.mutate({ roles: [selectedRole as UserRole] })}
         >
            Lưu role
         </Button>
         <p className="text-xs text-ink-500">
            Đổi role sẽ đăng xuất người dùng khỏi mọi thiết bị. Để chuyển sang nhân viên hoặc quản lý, tài khoản cần có
            hồ sơ nhân viên và ít nhất một chi nhánh.
         </p>
      </div>
   );
}

export default UserRoleCard;
