import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { updateUserInfo } from '@/api/auth/adminUserApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { validateFullName, validatePhone } from '@/lib/auth/validation';
import type { AdminUser, UpdateUserInfoRequest } from '@/types/auth/admin';
import { useAdminUserRefresh } from '../hooks/useAdminUserRefresh';
import { emptyToNull } from '../utils/validation';

interface UserInfoFormProps {
   adminUser: AdminUser;
}

interface UserInfoFieldErrors {
   fullName?: string;
   phone?: string;
}

export function UserInfoForm({ adminUser }: UserInfoFormProps): ReactElement {
   const [fullName, setFullName] = useState<string>(adminUser.fullName);
   const [phone, setPhone] = useState<string>(adminUser.phone ?? '');
   const [fieldErrors, setFieldErrors] = useState<UserInfoFieldErrors>({});
   const refreshAdminUser: () => void = useAdminUserRefresh(adminUser.id);

   const updateMutation: UseMutationResult<AdminUser, unknown, UpdateUserInfoRequest> = useMutation<
      AdminUser,
      unknown,
      UpdateUserInfoRequest
   >({
      mutationFn: (updateUserInfoRequest) => updateUserInfo(adminUser.id, updateUserInfoRequest),
      onSuccess: refreshAdminUser,
   });

   const isPhoneTaken: boolean =
      updateMutation.isError && getErrorCode(updateMutation.error) === 'PHONE_ALREADY_EXISTS';
   const isDeleted: boolean = adminUser.status === 'DELETED';

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      updateMutation.reset();
      const nextFieldErrors: UserInfoFieldErrors = {
         fullName: validateFullName(fullName),
         phone: validatePhone(phone),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.fullName || nextFieldErrors.phone) {
         return;
      }
      updateMutation.mutate({ fullName: fullName.trim(), phone: emptyToNull(phone) });
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
         {updateMutation.isError && !isPhoneTaken && (
            <Alert variant="error">{getErrorMessage(updateMutation.error)}</Alert>
         )}
         {updateMutation.isSuccess && <Alert variant="success">Đã cập nhật thông tin người dùng.</Alert>}
         <TextField
            id="admin-user-full-name"
            label="Họ và tên"
            value={fullName}
            onChange={setFullName}
            error={fieldErrors.fullName}
            disabled={isDeleted}
         />
         <TextField
            id="admin-user-phone"
            label="Số điện thoại"
            type="tel"
            value={phone}
            onChange={setPhone}
            optional
            error={fieldErrors.phone ?? (isPhoneTaken ? getErrorMessage(updateMutation.error) : undefined)}
            disabled={isDeleted}
         />
         <Button
            type="submit"
            isLoading={updateMutation.isPending}
            disabled={isDeleted}
            icon={<Save className="size-4" aria-hidden="true" />}
         >
            Lưu thông tin
         </Button>
      </form>
   );
}

export default UserInfoForm;
