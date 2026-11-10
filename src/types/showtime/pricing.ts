import type { ScreenType } from '@/types/cinema/cinema';

export type PriceRuleType = 'SCREEN_TYPE' | 'TIME_SLOT' | 'DAY_TYPE';

export type PriceDayType = 'ALL' | 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';

export interface PriceRule {
  id: number;
  ruleName: string;
  ruleType: PriceRuleType;
  dayType: PriceDayType;
  timeFrom: string | null;
  timeTo: string | null;
  screenType: ScreenType | null;
  validFrom: string | null;
  validTo: string | null;
  surchargeAmount: number;
  deleted: boolean;
}

export interface PriceRuleRequest {
  ruleName: string;
  ruleType: PriceRuleType;
  surchargeAmount: number;
  dayType: PriceDayType | null;
  timeFrom: string | null;
  timeTo: string | null;
  screenType: ScreenType | null;
  validFrom: string | null;
  validTo: string | null;
}

export interface AppliedPriceRule {
  ruleId: number;
  ruleName: string;
  ruleType: PriceRuleType;
  surchargeAmount: number;
}

export interface SeatTypePrice {
  seatTypeCode: string;
  seatTypeName: string;
  seatSurcharge: number;
  totalPrice: number;
}

export interface ShowtimePrice {
  showtimeId: number | null;
  screenType: ScreenType;
  startTime: string;
  basePrice: number;
  timeSlotSurcharge: number;
  dayTypeSurcharge: number;
  screenTypeSurcharge: number;
  appliedRules: AppliedPriceRule[];
  seatTypePrices: SeatTypePrice[];
}

export interface PriceSimulationRequest {
  basePrice: number;
  screenType: ScreenType;
  startTime: string;
}
