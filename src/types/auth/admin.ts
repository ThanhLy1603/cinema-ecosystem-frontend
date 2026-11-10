import type { BranchAssignment, MembershipTier, UserRole } from './auth';
import type { StaffPosition, StaffStatus } from './staff';

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'DELETED';

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'STATUS_CHANGED'
  | 'ROLES_CHANGED'
  | 'BRANCHES_CHANGED'
  | 'PASSWORD_RESET_BY_ADMIN'
  | 'USER_DELETED';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  hasPassword: boolean;
  roles: UserRole[];
  tier: MembershipTier;
  loyaltyPoints: number;
  lastLoginAt?: string;
  createdAt: string;
  employeeCode?: string;
  position?: StaffPosition;
  staffStatus?: StaffStatus;
  hiredAt?: string;
  branches: BranchAssignment[];
}

export interface AuditLog {
  id: number;
  actorId?: number;
  actorName?: string;
  targetUserId: number;
  action: AuditAction;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  cinemaId?: number;
  page: number;
  size: number;
}

export interface UpdateUserInfoRequest {
  fullName: string;
  phone: string | null;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface UpdateUserRolesRequest {
  roles: UserRole[];
}
