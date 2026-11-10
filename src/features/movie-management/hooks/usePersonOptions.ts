import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getPersonOptions } from '@/api/movieApi';
import type { PersonOption } from '@/types/movie';
import { PERSON_OPTIONS_KEY } from '../utils/queryKeys';

export function usePersonOptions(): UseQueryResult<PersonOption[]> {
   return useQuery<PersonOption[]>({ queryKey: PERSON_OPTIONS_KEY, queryFn: getPersonOptions });
}
