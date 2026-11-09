import { useState, type ReactElement } from 'react';
import { getInitials } from '@/lib/initials';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface UserAvatarProps {
   user: Pick<User, 'fullName' | 'avatarUrl'>;
   className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps): ReactElement {
   const [hasImageFailed, setHasImageFailed] = useState<boolean>(false);

   if (user.avatarUrl && !hasImageFailed) {
      return (
         <img
            src={user.avatarUrl}
            alt={user.fullName}
            onError={() => setHasImageFailed(true)}
            className={cn('size-10 rounded-full object-cover ring-2 ring-white', className)}
         />
      );
   }

   return (
      <span
         aria-hidden="true"
         className={cn(
            'grid size-10 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-brand-500 text-sm font-bold text-white ring-2 ring-white',
            className,
         )}
      >
         {getInitials(user.fullName)}
      </span>
   );
}

export default UserAvatar;
