import type { SelectOption } from '@/components/ui/SelectField';
import { getRoleLabel } from '@/lib/auth/roleLabels';
import type { AuditAction, UserStatus } from '@/types/auth/admin';
import type { UserRole } from '@/types/auth/auth';
import type { StaffPosition, StaffStatus } from '@/types/auth/staff';

export const ALL_ROLES: UserRole[] = ['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN'];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
   ACTIVE: 'Đang hoạt động',
   LOCKED: 'Bị khóa tạm',
   SUSPENDED: 'Đã khóa',
   DELETED: 'Đã xóa',
};

export const STAFF_POSITION_LABELS: Record<StaffPosition, string> = {
   TICKETING_STAFF: 'Nhân viên bán vé',
   MANAGER: 'Quản lý',
   AUDITOR: 'Kiểm soát viên',
};

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
   ACTIVE: 'Đang làm việc',
   ON_LEAVE: 'Nghỉ phép',
   RESIGNED: 'Đã nghỉ việc',
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
   USER_CREATED: 'Tạo tài khoản',
   USER_UPDATED: 'Sửa thông tin',
   STATUS_CHANGED: 'Đổi trạng thái',
   ROLES_CHANGED: 'Đổi role',
   BRANCHES_CHANGED: 'Đổi chi nhánh',
   PASSWORD_RESET_BY_ADMIN: 'Đặt lại mật khẩu',
   USER_DELETED: 'Xóa tài khoản',
};

export const ROLE_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Tất cả role' },
   ...ALL_ROLES.map((userRole) => ({ value: userRole, label: getRoleLabel(userRole) })),
];

export const ROLE_OPTIONS: SelectOption[] = ALL_ROLES.map((userRole) => ({
   value: userRole,
   label: getRoleLabel(userRole),
}));

export const STATUS_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Mọi trạng thái' },
   { value: 'ACTIVE', label: USER_STATUS_LABELS.ACTIVE },
   { value: 'LOCKED', label: USER_STATUS_LABELS.LOCKED },
   { value: 'SUSPENDED', label: USER_STATUS_LABELS.SUSPENDED },
   { value: 'DELETED', label: USER_STATUS_LABELS.DELETED },
];

export const STAFF_POSITION_OPTIONS: SelectOption[] = [
   { value: 'TICKETING_STAFF', label: STAFF_POSITION_LABELS.TICKETING_STAFF },
   { value: 'MANAGER', label: STAFF_POSITION_LABELS.MANAGER },
   { value: 'AUDITOR', label: STAFF_POSITION_LABELS.AUDITOR },
];

export const STAFF_STATUS_OPTIONS: SelectOption[] = [
   { value: 'ACTIVE', label: STAFF_STATUS_LABELS.ACTIVE },
   { value: 'ON_LEAVE', label: STAFF_STATUS_LABELS.ON_LEAVE },
   { value: 'RESIGNED', label: STAFF_STATUS_LABELS.RESIGNED },
];
