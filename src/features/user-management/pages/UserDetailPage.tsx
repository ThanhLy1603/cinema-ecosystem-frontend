import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAdminUser } from '@/api/adminUserApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import UserAvatar from '@/components/common/UserAvatar';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/apiError';
import { getPrimaryRoleLabel } from '@/lib/roleLabels';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AdminUser } from '@/types/admin';
import type { User } from '@/types/auth';
import AuditLogCard from '../components/AuditLogCard';
import DeleteUserCard from '../components/DeleteUserCard';
import SectionCard from '@/components/common/SectionCard';
import StaffProfileForm from '../components/StaffProfileForm';
import StatusBadge from '../components/StatusBadge';
import UserBranchCard from '../components/UserBranchCard';
import UserInfoForm from '../components/UserInfoForm';
import UserRoleCard from '../components/UserRoleCard';
import UserStatusCard from '../components/UserStatusCard';
import { STAFF_POSITION_LABELS, STAFF_STATUS_LABELS } from '../utils/labels';
import { formatDateTime } from '../utils/format';
import { adminUserDetailKey } from '../utils/queryKeys';

export function UserDetailPage(): ReactElement {
   const { userId: userIdParam } = useParams<{ userId: string }>();
   const userId: number = Number(userIdParam);
   const isValidUserId: boolean = Number.isInteger(userId) && userId > 0;
   const currentUser: User | null = useAuthStore((authState) => authState.user);
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const userQuery: UseQueryResult<AdminUser> = useQuery<AdminUser>({
      queryKey: adminUserDetailKey(userId),
      queryFn: () => getAdminUser(userId),
      enabled: isValidUserId,
   });

   const backLink: ReactElement = (
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Về danh sách người dùng
      </Link>
   );

   if (!isValidUserId) {
      return (
         <div className="w-full max-w-3xl space-y-4">
            <Alert variant="error">Mã người dùng không hợp lệ.</Alert>
            {backLink}
         </div>
      );
   }
   if (userQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (userQuery.isError) {
      return (
         <div className="w-full max-w-3xl space-y-4">
            <Alert variant="error">{getErrorMessage(userQuery.error)}</Alert>
            {backLink}
         </div>
      );
   }

   const adminUser: AdminUser = userQuery.data;
   const isSelf: boolean = currentUser?.id === adminUser.id;
   const isStaffAccount: boolean = adminUser.roles.includes('ROLE_STAFF') || adminUser.roles.includes('ROLE_MANAGER');
   const isDeleted: boolean = adminUser.status === 'DELETED';

   return (
      <div className="w-full max-w-6xl space-y-8">
         {backLink}

         <header className="flex flex-wrap items-center gap-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100">
            <UserAvatar user={adminUser} className="size-20 text-xl" />
            <div className="min-w-0 flex-1">
               <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink-900">{adminUser.fullName}</h1>
               <p className="truncate text-sm text-ink-500">{adminUser.email}</p>
               <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                     {getPrimaryRoleLabel(adminUser)}
                  </span>
                  <StatusBadge userStatus={adminUser.status} />
                  {!adminUser.emailVerified && (
                     <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-xs font-semibold text-ink-800 ring-1 ring-gold-200">
                        Email chưa xác thực
                     </span>
                  )}
               </div>
            </div>
            <dl className="grid gap-1 text-sm text-ink-600">
               <div>
                  <dt className="inline text-ink-500">Đăng nhập gần nhất: </dt>
                  <dd className="inline font-semibold text-ink-900">{formatDateTime(adminUser.lastLoginAt)}</dd>
               </div>
               <div>
                  <dt className="inline text-ink-500">Ngày tạo: </dt>
                  <dd className="inline font-semibold text-ink-900">{formatDateTime(adminUser.createdAt)}</dd>
               </div>
               {adminUser.employeeCode && (
                  <div>
                     <dt className="inline text-ink-500">Nhân viên: </dt>
                     <dd className="inline font-semibold text-ink-900">
                        {adminUser.employeeCode}
                        {adminUser.position ? ` · ${STAFF_POSITION_LABELS[adminUser.position]}` : ''}
                        {adminUser.staffStatus ? ` · ${STAFF_STATUS_LABELS[adminUser.staffStatus]}` : ''}
                     </dd>
                  </div>
               )}
               {adminUser.branches.length > 0 && (
                  <div>
                     <dt className="inline text-ink-500">Chi nhánh: </dt>
                     <dd className="inline font-semibold text-ink-900">
                        {adminUser.branches
                           .map(
                              (branchAssignment) =>
                                 `${branchAssignment.cinemaName ?? `#${branchAssignment.cinemaId}`}${
                                    branchAssignment.primary ? ' (chính)' : ''
                                 }`,
                           )
                           .join(', ')}
                     </dd>
                  </div>
               )}
            </dl>
         </header>

         <div className="grid gap-8 lg:grid-cols-2">
            <SectionCard title="Thông tin cá nhân">
               <UserInfoForm key={adminUser.id} adminUser={adminUser} />
            </SectionCard>
            <SectionCard title="Trạng thái tài khoản">
               <UserStatusCard adminUser={adminUser} isSelf={isSelf} />
            </SectionCard>
            {isAdmin && !isDeleted && (
               <SectionCard title="Role">
                  <UserRoleCard
                     key={`${adminUser.id}-${adminUser.roles.join()}`}
                     adminUser={adminUser}
                     isSelf={isSelf}
                  />
               </SectionCard>
            )}
            {isAdmin && !isDeleted && adminUser.employeeCode && isStaffAccount && (
               <SectionCard title="Hồ sơ nhân viên">
                  <StaffProfileForm key={adminUser.id} adminUser={adminUser} />
               </SectionCard>
            )}
            {isAdmin && !isDeleted && isStaffAccount && (
               <SectionCard title="Chi nhánh làm việc" description="Chọn các chi nhánh và một chi nhánh chính.">
                  <UserBranchCard key={adminUser.id} adminUser={adminUser} />
               </SectionCard>
            )}
            {isAdmin && (
               <SectionCard title="Xóa tài khoản">
                  <DeleteUserCard adminUser={adminUser} isSelf={isSelf} />
               </SectionCard>
            )}
         </div>

         {isAdmin && (
            <SectionCard title="Nhật ký thao tác">
               <AuditLogCard userId={adminUser.id} />
            </SectionCard>
         )}
      </div>
   );
}

export default UserDetailPage;
