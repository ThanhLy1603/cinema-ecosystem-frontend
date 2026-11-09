export const ADMIN_USER_LIST_KEY: readonly string[] = ['admin-users', 'list'];
export const CINEMA_OPTIONS_QUERY_KEY: readonly string[] = ['cinema-options'];

export function adminUserDetailKey(userId: number): readonly (string | number)[] {
   return ['admin-users', 'detail', userId];
}

export function adminUserAuditKey(userId: number, page: number): readonly (string | number)[] {
   return ['admin-users', 'audit', userId, page];
}
