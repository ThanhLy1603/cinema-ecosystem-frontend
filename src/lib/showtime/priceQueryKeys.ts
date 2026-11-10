import type { PriceSimulationRequest } from '@/types/showtime/pricing';

export const PRICE_SIMULATION_KEY: readonly string[] = ['price-simulation'];

export function priceSimulationKey(
   priceSimulationRequest: PriceSimulationRequest,
): readonly (string | PriceSimulationRequest)[] {
   return ['price-simulation', priceSimulationRequest];
}
