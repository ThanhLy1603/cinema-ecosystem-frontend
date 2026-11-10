import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getSchedulableMovies } from '@/api/showtimeApi';
import type { MovieInfo } from '@/types/showtime/showtime';
import { SCHEDULABLE_MOVIES_KEY } from '../utils/queryKeys';

const SCHEDULABLE_MOVIES_STALE_TIME_MS: number = 60 * 1000;

export function useSchedulableMovies(): UseQueryResult<MovieInfo[]> {
   return useQuery<MovieInfo[]>({
      queryKey: SCHEDULABLE_MOVIES_KEY,
      queryFn: getSchedulableMovies,
      staleTime: SCHEDULABLE_MOVIES_STALE_TIME_MS,
   });
}
