const DEFAULT_REDIRECT_PATH: string = '/';

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
