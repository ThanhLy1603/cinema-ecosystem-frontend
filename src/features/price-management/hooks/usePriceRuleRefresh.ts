import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { PRICE_SIMULATION_KEY } from '@/lib/showtime/priceQueryKeys';
import { PUBLIC_SHOWTIMES_KEY } from '@/lib/showtime/showtimeQueryKeys';
import { ADMIN_PRICE_RULES_KEY } from '../utils/queryKeys';

export function usePriceRuleRefresh(): () => void {
   const queryClient: QueryClient = useQueryClient();

   return function refreshPriceRules(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRICE_RULES_KEY });
      void queryClient.invalidateQueries({ queryKey: PRICE_SIMULATION_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_SHOWTIMES_KEY });
   };
}
