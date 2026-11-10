import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getSeatTypes } from '@/api/cinemaApi';
import { SEAT_TYPES_KEY } from '@/lib/cinema/cinemaQueryKeys';
import type { SeatType } from '@/types/cinema/cinema';

const SEAT_TYPES_STALE_TIME_MS: number = 10 * 60 * 1000;

export function useSeatTypes(): UseQueryResult<SeatType[]> {
   return useQuery<SeatType[]>({
      queryKey: SEAT_TYPES_KEY,
      queryFn: getSeatTypes,
      staleTime: SEAT_TYPES_STALE_TIME_MS,
   });
}
