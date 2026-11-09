import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import { getPrimaryRoleLabel } from '@/lib/roleLabels';
import type { AdminUser } from '@/types/admin';
import type { BranchAssignment } from '@/types/auth';
import { formatDateTime } from '../utils/format';
import StatusBadge from './StatusBadge';

interface UserTableProps {
   adminUsers: AdminUser[];
}

function formatBranches(branchAssignments: BranchAssignment[]): string {
   if (branchAssignments.length === 0) {
      return '—';
   }
   return branchAssignments
      .map((branchAssignment) => branchAssignment.cinemaName ?? `#${branchAssignment.cinemaId}`)
      .join(', ');
}

export function UserTable({ adminUsers }: UserTableProps): ReactElement {
   if (adminUsers.length === 0) {
      return (
         <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-100">
            Không có người dùng nào phù hợp với bộ lọc.
         </p>
      );
   }

   return (
      <div className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-ink-100">
         <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
               <tr>
                  <th className="px-5 py-4 font-semibold">Người dùng</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="px-5 py-4 font-semibold">Chi nhánh</th>
                  <th className="px-5 py-4 font-semibold">Đăng nhập gần nhất</th>
                  <th className="px-5 py-4" />
               </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
               {adminUsers.map((adminUser) => (
                  <tr key={adminUser.id} className="hover:bg-ink-50/60">
                     <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <UserAvatar user={adminUser} className="size-10 shrink-0" />
                           <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900">{adminUser.fullName}</p>
                              <p className="truncate text-xs text-ink-500">{adminUser.email}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-5 py-4 text-ink-700">{getPrimaryRoleLabel(adminUser)}</td>
                     <td className="px-5 py-4">
                        <StatusBadge userStatus={adminUser.status} />
                     </td>
                     <td className="max-w-[220px] truncate px-5 py-4 text-ink-700">
                        {formatBranches(adminUser.branches)}
                     </td>
                     <td className="px-5 py-4 text-ink-600">{formatDateTime(adminUser.lastLoginAt)}</td>
                     <td className="px-5 py-4 text-right">
                        <Link
                           to={`/admin/users/${adminUser.id}`}
                           className="font-semibold text-brand-700 hover:underline"
                        >
                           Chi tiết
                        </Link>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}

export default UserTable;
