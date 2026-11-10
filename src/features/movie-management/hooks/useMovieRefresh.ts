import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { PUBLIC_MOVIES_KEY } from '@/lib/movie/movieQueryKeys';
import { ADMIN_MOVIE_LIST_KEY, adminMovieDetailKey } from '../utils/queryKeys';

export function useMovieRefresh(movieId: number | null): () => void {
   const queryClient: QueryClient = useQueryClient();

   return function refreshMovie(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_MOVIE_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_MOVIES_KEY });
      if (movieId !== null) {
         void queryClient.invalidateQueries({ queryKey: adminMovieDetailKey(movieId) });
      }
   };
}
