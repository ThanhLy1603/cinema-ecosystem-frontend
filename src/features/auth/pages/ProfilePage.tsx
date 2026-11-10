import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Crown, Link2, Star } from 'lucide-react';
import type { ReactElement } from 'react';
import { getMyProfile } from '@/api/userApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import UserAvatar from '@/components/common/UserAvatar';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import type { MembershipTier, UserProfile } from '@/types/auth/auth';
import BranchAssignmentList from '../components/BranchAssignmentList';
import ChangePasswordForm from '../components/ChangePasswordForm';
import EmailVerificationNotice from '../components/EmailVerificationNotice';
import ProfileForm from '../components/ProfileForm';
import { PROFILE_QUERY_KEY } from '../utils/queryKeys';
import { getPrimaryRoleLabel } from '@/lib/auth/roleLabels';

const TIER_LABELS: Record<MembershipTier, string> = {
   STAR: 'Star',
   GOLD: 'Gold',
   DIAMOND: 'Diamond',
};

function formatLinkedProviders(userProfile: UserProfile): string {
   return userProfile.linkedProviders.length === 0 ? 'Chưa liên kết' : userProfile.linkedProviders.join(', ');
}

export function ProfilePage(): ReactElement {
   const profileQuery: UseQueryResult<UserProfile> = useQuery<UserProfile>({
      queryKey: PROFILE_QUERY_KEY,
      queryFn: getMyProfile,
   });

   if (profileQuery.isPending) {
      return <FullPageSpinner />;
   }

   if (profileQuery.isError) {
      return (
         <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-16 sm:px-6">
            <Alert variant="error">{getErrorMessage(profileQuery.error)}</Alert>
            <Button variant="secondary" onClick={() => void profileQuery.refetch()}>
               Thử lại
            </Button>
         </div>
      );
   }

   const userProfile: UserProfile = profileQuery.data;

   return (
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
         <header className="flex flex-wrap items-center gap-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100">
            <UserAvatar user={userProfile} className="size-20 text-xl" />
            <div className="min-w-0 flex-1">
               <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink-900">{userProfile.fullName}</h1>
               <p className="truncate text-sm text-ink-500">{userProfile.email}</p>
               <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {getPrimaryRoleLabel(userProfile)}
               </p>
            </div>
            <dl className="flex gap-6 text-sm">
               <div>
                  <dt className="flex items-center gap-1.5 text-ink-500">
                     <Crown className="size-4" aria-hidden="true" />
                     Hạng thành viên
                  </dt>
                  <dd className="mt-0.5 font-bold text-ink-900">{TIER_LABELS[userProfile.tier]}</dd>
               </div>
               <div>
                  <dt className="flex items-center gap-1.5 text-ink-500">
                     <Star className="size-4" aria-hidden="true" />
                     Điểm tích lũy
                  </dt>
                  <dd className="mt-0.5 font-bold text-ink-900">{userProfile.loyaltyPoints.toLocaleString('vi-VN')}</dd>
               </div>
               <div>
                  <dt className="flex items-center gap-1.5 text-ink-500">
                     <Link2 className="size-4" aria-hidden="true" />
                     Liên kết
                  </dt>
                  <dd className="mt-0.5 font-bold text-ink-900">{formatLinkedProviders(userProfile)}</dd>
               </div>
            </dl>
         </header>

         {!userProfile.emailVerified && <EmailVerificationNotice />}

         {userProfile.branches.length > 0 && (
            <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
               <h2 className="mb-6 text-xl font-bold text-ink-900">Chi nhánh làm việc</h2>
               <BranchAssignmentList branchAssignments={userProfile.branches} />
            </section>
         )}

         <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
               <h2 className="mb-6 text-xl font-bold text-ink-900">Thông tin cá nhân</h2>
               <ProfileForm key={userProfile.id} userProfile={userProfile} />
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
               <h2 className="mb-6 text-xl font-bold text-ink-900">
                  {userProfile.hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
               </h2>
               <ChangePasswordForm hasPassword={userProfile.hasPassword} />
            </section>
         </div>
      </div>
   );
}

export default ProfilePage;
