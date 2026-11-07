export function getRedirectPath(locationState: unknown): string {
   if (typeof locationState === 'object' && locationState !== null && 'from' in locationState) {
      const from: unknown = locationState.from
      if (typeof from === 'object' && from !== null && 'pathname' in from && typeof from.pathname === 'string') {
         return from.pathname
      }
   }
   return '/'
}
