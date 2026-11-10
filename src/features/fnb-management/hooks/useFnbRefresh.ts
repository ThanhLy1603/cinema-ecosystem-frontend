import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { PUBLIC_FNB_KEY } from '@/lib/fnb/fnbQueryKeys';
import { ADMIN_FNB_KEY } from '../utils/queryKeys';

export function useFnbRefresh(): () => void {
   const queryClient: QueryClient = useQueryClient();

   return function refreshFnb(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_FNB_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_FNB_KEY });
   };
}
