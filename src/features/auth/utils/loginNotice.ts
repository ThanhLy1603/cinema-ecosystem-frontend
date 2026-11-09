export const PASSWORD_RESET_NOTICE: string = 'PASSWORD_RESET';

export function getLoginNotice(locationState: unknown): string | null {
   if (typeof locationState === 'object' && locationState !== null && 'notice' in locationState) {
      return typeof locationState.notice === 'string' ? locationState.notice : null;
   }
   return null;
}
