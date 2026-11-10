import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { PUBLIC_SHOWTIMES_KEY } from '@/lib/showtimeQueryKeys';
import { ADMIN_SHOWTIMES_KEY } from '../utils/queryKeys';

export function useShowtimeRefresh(): () => void {
   const queryClient: QueryClient = useQueryClient();

   return function refreshShowtimes(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_SHOWTIMES_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_SHOWTIMES_KEY });
   };
}
