import type { User } from '@/types/auth/auth';

const DEFAULT_REDIRECT_PATH: string = '/';
const STAFF_HOME_PATH: string = '/staff';

function isSafeInternalPath(pathname: string): boolean {
   return pathname.startsWith('/') && !pathname.startsWith('//');
}

export function getRedirectPath(locationState: unknown): string {
   if (typeof locationState === 'object' && locationState !== null && 'from' in locationState) {
      const from: unknown = locationState.from;
      if (typeof from === 'object' && from !== null && 'pathname' in from && typeof from.pathname === 'string') {
         if (!isSafeInternalPath(from.pathname)) {
            return DEFAULT_REDIRECT_PATH;
         }
         const search: string = 'search' in from && typeof from.search === 'string' ? from.search : '';
         const hash: string = 'hash' in from && typeof from.hash === 'string' ? from.hash : '';
         return `${from.pathname}${search}${hash}`;
      }
   }
   return DEFAULT_REDIRECT_PATH;
}

export function getPostLoginPath(redirectPath: string, user: Pick<User, 'roles'> | null): string {
   if (redirectPath !== DEFAULT_REDIRECT_PATH || user === null) {
      return redirectPath;
   }
   const isStaffOnly: boolean =
      user.roles.includes('ROLE_STAFF') && !user.roles.includes('ROLE_MANAGER') && !user.roles.includes('ROLE_ADMIN');
   return isStaffOnly ? STAFF_HOME_PATH : redirectPath;
}
