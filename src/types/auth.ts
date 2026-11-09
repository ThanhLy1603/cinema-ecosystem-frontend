export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: UserRole[];
  loyaltyPoints: number;
  tier: MembershipTier;
  emailVerified: boolean;
}

export type MembershipTier = 'STAR' | 'GOLD' | 'DIAMOND';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type AuthProvider = 'GOOGLE';

export interface BranchAssignment {
  cinemaId: number;
  cinemaName: string | null;
  primary: boolean;
}

export interface UserProfile extends User {
  dateOfBirth?: string;
  gender?: Gender;
  hasPassword: boolean;
  linkedProviders: AuthProvider[];
  branches: BranchAssignment[];
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  avatarUrl: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface LoginResponse {
  user: User;
}

export interface RefreshTokenResponse {
  user: User;
}
