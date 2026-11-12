import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { simulatePrices } from '@/api/showtime/pricingApi';
import { parseValidMoneyInput } from '@/lib/common/moneyInput';
import { priceSimulationKey } from '@/lib/showtime/priceQueryKeys';
import { useDebouncedValue } from '@/lib/common/useDebouncedValue';
import { isValidDate, isValidTimeOfDay, toVietnamInstant } from '@/lib/common/vietnamTime';
import type { Hall } from '@/types/cinema/cinema';
import type { PriceSimulationRequest, ShowtimePrice } from '@/types/showtime/pricing';
import type { ShowtimeFormValues } from '../utils/validation';

const PREVIEW_DEBOUNCE_MS: number = 400;

function buildPreviewRequest(showtimeFormValues: ShowtimeFormValues, halls: Hall[]): PriceSimulationRequest | null {
   const hall: Hall | undefined = halls.find((hallItem) => String(hallItem.id) === showtimeFormValues.hallId);
   const basePrice: number | null = parseValidMoneyInput(showtimeFormValues.basePrice);
   const hasValidMoment: boolean =
      isValidDate(showtimeFormValues.date) && isValidTimeOfDay(showtimeFormValues.startTime);
   if (!hall || basePrice === null || !hasValidMoment) {
      return null;
   }
   return {
      basePrice,
      screenType: hall.screenType,
      startTime: toVietnamInstant(showtimeFormValues.date, showtimeFormValues.startTime),
   };
}

export function useShowtimePricePreview(
   showtimeFormValues: ShowtimeFormValues,
   halls: Hall[],
): UseQueryResult<ShowtimePrice> {
   const debouncedShowtimeFormValues: ShowtimeFormValues = useDebouncedValue<ShowtimeFormValues>(
      showtimeFormValues,
      PREVIEW_DEBOUNCE_MS,
   );
   const priceSimulationRequest: PriceSimulationRequest | null = buildPreviewRequest(
      debouncedShowtimeFormValues,
      halls,
   );

   return useQuery<ShowtimePrice>({
      queryKey: priceSimulationRequest ? priceSimulationKey(priceSimulationRequest) : ['price-simulation', 'idle'],
      queryFn: () => simulatePrices(priceSimulationRequest as PriceSimulationRequest),
      enabled: priceSimulationRequest !== null,
      placeholderData: (previousShowtimePrice) => previousShowtimePrice,
   });
}
