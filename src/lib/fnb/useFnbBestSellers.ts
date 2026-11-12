import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getFnbBestSellers } from '@/api/fnbApi';
import type { FnbBestSellers } from '@/types/fnb/fnb';
import { FNB_BEST_SELLERS_KEY } from './fnbQueryKeys';

const BEST_SELLERS_STALE_MILLISECONDS: number = 5 * 60 * 1000;
const EMPTY_ID_SET: ReadonlySet<number> = new Set<number>();

export interface FnbBestSellerIds {
   comboIds: ReadonlySet<number>;
   itemIds: ReadonlySet<number>;
}

export function useFnbBestSellers(): FnbBestSellerIds {
   const bestSellersQuery: UseQueryResult<FnbBestSellers> = useQuery<FnbBestSellers>({
      queryKey: FNB_BEST_SELLERS_KEY,
      queryFn: getFnbBestSellers,
      staleTime: BEST_SELLERS_STALE_MILLISECONDS,
      retry: false,
   });

   if (!bestSellersQuery.data) {
      return { comboIds: EMPTY_ID_SET, itemIds: EMPTY_ID_SET };
   }
   return {
      comboIds: new Set<number>(bestSellersQuery.data.comboIds),
      itemIds: new Set<number>(bestSellersQuery.data.itemIds),
   };
}
