import type { User, UserRole } from '@/types/auth/auth';

const ROLE_PRIORITY: UserRole[] = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_CUSTOMER'];

const ROLE_LABELS: Record<UserRole, string> = {
   ROLE_ADMIN: 'Quản trị viên',
   ROLE_MANAGER: 'Quản lý chi nhánh',
   ROLE_STAFF: 'Nhân viên rạp',
   ROLE_CUSTOMER: 'Thành viên',
};

export function getRoleLabel(userRole: UserRole): string {
   return ROLE_LABELS[userRole];
}

export function getPrimaryRoleLabel(user: Pick<User, 'roles'>): string {
   const primaryRole: UserRole | undefined = ROLE_PRIORITY.find((userRole) => user.roles.includes(userRole));
   return primaryRole ? ROLE_LABELS[primaryRole] : ROLE_LABELS.ROLE_CUSTOMER;
}
