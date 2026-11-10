import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAdminGenres } from '@/api/movieApi';
import type { Genre } from '@/types/movie';
import { ADMIN_GENRES_KEY } from '../utils/queryKeys';

export function useGenres(): UseQueryResult<Genre[]> {
   return useQuery<Genre[]>({ queryKey: ADMIN_GENRES_KEY, queryFn: getAdminGenres });
}
