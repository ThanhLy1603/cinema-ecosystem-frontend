import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getCinemaOptions } from '@/api/cinemaApi';
import type { CinemaOption } from '@/types/cinema/cinema';
import { CINEMA_OPTIONS_QUERY_KEY } from '../utils/queryKeys';

const CINEMA_OPTIONS_STALE_TIME_MS: number = 5 * 60 * 1000;

export function useCinemaOptions(): UseQueryResult<CinemaOption[]> {
   return useQuery<CinemaOption[]>({
      queryKey: CINEMA_OPTIONS_QUERY_KEY,
      queryFn: getCinemaOptions,
      staleTime: CINEMA_OPTIONS_STALE_TIME_MS,
   });
}
