import type { BranchAssignment, UserRole } from './auth';

export type StaffRole = Extract<UserRole, 'ROLE_STAFF' | 'ROLE_MANAGER'>;

export type StaffPosition = 'TICKETING_STAFF' | 'MANAGER' | 'AUDITOR';

export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';

export interface StaffResponse {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  userStatus: string;
  emailVerified: boolean;
  roles: UserRole[];
  employeeCode: string;
  position: StaffPosition;
  staffStatus: StaffStatus;
  hiredAt?: string;
  branches: BranchAssignment[];
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  role: StaffRole;
  employeeCode: string;
  position: StaffPosition;
  hiredAt?: string | null;
  cinemaIds: number[];
  primaryCinemaId?: number | null;
}

export interface UpdateStaffRequest {
  role: StaffRole;
  employeeCode: string;
  position: StaffPosition;
  status: StaffStatus;
  hiredAt?: string | null;
}

export interface AssignBranchesRequest {
  cinemaIds: number[];
  primaryCinemaId?: number | null;
}
