import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getFacilities } from '@/api/cinemaApi';
import type { Facility } from '@/types/cinema';
import { ADMIN_FACILITIES_KEY } from '../utils/queryKeys';

export function useFacilities(deleted: boolean = false): UseQueryResult<Facility[]> {
   return useQuery<Facility[]>({
      queryKey: [...ADMIN_FACILITIES_KEY, deleted],
      queryFn: () => getFacilities(deleted),
   });
}
