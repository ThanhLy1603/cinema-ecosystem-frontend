import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { updateStaff } from '@/api/auth/staffApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import type { AdminUser } from '@/types/auth/admin';
import type { StaffPosition, StaffResponse, StaffRole, StaffStatus, UpdateStaffRequest } from '@/types/auth/staff';
import { useAdminUserRefresh } from '../hooks/useAdminUserRefresh';
import { STAFF_POSITION_OPTIONS, STAFF_STATUS_OPTIONS } from '../utils/labels';
import { emptyToNull, validateEmployeeCode, validateRequiredSelection } from '../utils/validation';

interface StaffProfileFormProps {
   adminUser: AdminUser;
}

export function StaffProfileForm({ adminUser }: StaffProfileFormProps): ReactElement {
   const staffRole: StaffRole = adminUser.roles.includes('ROLE_MANAGER') ? 'ROLE_MANAGER' : 'ROLE_STAFF';
   const [employeeCode, setEmployeeCode] = useState<string>(adminUser.employeeCode ?? '');
   const [position, setPosition] = useState<string>(adminUser.position ?? 'TICKETING_STAFF');
   const [staffStatus, setStaffStatus] = useState<string>(adminUser.staffStatus ?? 'ACTIVE');
   const [hiredAt, setHiredAt] = useState<string>(adminUser.hiredAt ?? '');
   const [employeeCodeError, setEmployeeCodeError] = useState<string | undefined>(undefined);
   const [positionError, setPositionError] = useState<string | undefined>(undefined);
   const [staffStatusError, setStaffStatusError] = useState<string | undefined>(undefined);
   const refreshAdminUser: () => void = useAdminUserRefresh(adminUser.id);

   const updateMutation: UseMutationResult<StaffResponse, unknown, UpdateStaffRequest> = useMutation<
      StaffResponse,
      unknown,
      UpdateStaffRequest
   >({
      mutationFn: (updateStaffRequest) => updateStaff(adminUser.id, updateStaffRequest),
      onSuccess: refreshAdminUser,
   });

   const isCodeTaken: boolean =
      updateMutation.isError && getErrorCode(updateMutation.error) === 'EMPLOYEE_CODE_ALREADY_EXISTS';

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      updateMutation.reset();
      const nextEmployeeCodeError: string | undefined = validateEmployeeCode(employeeCode);
      const nextPositionError: string | undefined = validateRequiredSelection(position, 'Vui lòng chọn chức danh');
      const nextStaffStatusError: string | undefined = validateRequiredSelection(
         staffStatus,
         'Vui lòng chọn trạng thái làm việc',
      );
      setEmployeeCodeError(nextEmployeeCodeError);
      setPositionError(nextPositionError);
      setStaffStatusError(nextStaffStatusError);
      if (nextEmployeeCodeError || nextPositionError || nextStaffStatusError) {
         return;
      }
      updateMutation.mutate({
         role: staffRole,
         employeeCode: employeeCode.trim(),
         position: position as StaffPosition,
         status: staffStatus as StaffStatus,
         hiredAt: emptyToNull(hiredAt),
      });
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
         {updateMutation.isError && !isCodeTaken && (
            <Alert variant="error">{getErrorMessage(updateMutation.error)}</Alert>
         )}
         {updateMutation.isSuccess && <Alert variant="success">Đã cập nhật hồ sơ nhân viên.</Alert>}
         <TextField
            id="staff-employee-code"
            label="Mã nhân viên"
            value={employeeCode}
            onChange={setEmployeeCode}
            error={employeeCodeError ?? (isCodeTaken ? getErrorMessage(updateMutation.error) : undefined)}
         />
         <SelectField
            id="staff-position"
            label="Chức danh"
            value={position}
            onChange={setPosition}
            options={STAFF_POSITION_OPTIONS}
            error={positionError}
         />
         <SelectField
            id="staff-status"
            label="Trạng thái làm việc"
            value={staffStatus}
            onChange={setStaffStatus}
            options={STAFF_STATUS_OPTIONS}
            error={staffStatusError}
         />
         <TextField
            id="staff-hired-at"
            label="Ngày vào làm"
            type="date"
            value={hiredAt}
            onChange={setHiredAt}
            optional
         />
         <Button
            type="submit"
            isLoading={updateMutation.isPending}
            icon={<Save className="size-4" aria-hidden="true" />}
         >
            Lưu hồ sơ nhân viên
         </Button>
      </form>
   );
}

export default StaffProfileForm;
