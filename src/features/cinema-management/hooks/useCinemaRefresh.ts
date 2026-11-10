import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { CINEMA_OPTIONS_KEY, PUBLIC_CINEMAS_KEY } from '@/lib/cinema/cinemaQueryKeys';
import { ADMIN_CINEMA_LIST_KEY, adminCinemaDetailKey, adminDeletedHallsKey } from '../utils/queryKeys';

export function useCinemaRefresh(cinemaId: number | null): () => void {
   const queryClient: QueryClient = useQueryClient();

   return function refreshCinema(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_CINEMA_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_CINEMAS_KEY });
      void queryClient.invalidateQueries({ queryKey: CINEMA_OPTIONS_KEY });
      if (cinemaId !== null) {
         void queryClient.invalidateQueries({ queryKey: adminCinemaDetailKey(cinemaId) });
         void queryClient.invalidateQueries({ queryKey: adminDeletedHallsKey(cinemaId) });
      }
   };
}
