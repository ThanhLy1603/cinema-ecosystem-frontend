import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { ADMIN_USER_LIST_KEY, adminUserDetailKey } from '../utils/queryKeys';

export function useAdminUserRefresh(userId: number): () => void {
   const queryClient: QueryClient = useQueryClient();

   return function refreshAdminUser(): void {
      void queryClient.invalidateQueries({ queryKey: adminUserDetailKey(userId) });
      void queryClient.invalidateQueries({ queryKey: ADMIN_USER_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ['admin-users', 'audit', userId] });
   };
}
