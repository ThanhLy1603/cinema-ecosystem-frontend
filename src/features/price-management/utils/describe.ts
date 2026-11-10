import { PRICE_DAY_TYPE_LABELS } from '@/lib/showtime/priceLabels';
import { formatDisplayDate } from '@/lib/common/vietnamTime';
import type { PriceRule } from '@/types/showtime/pricing';

const TIME_PREFIX_LENGTH: number = 5;

function toClock(time: string): string {
   return time.slice(0, TIME_PREFIX_LENGTH);
}

export function describeCondition(priceRule: PriceRule): string {
   if (priceRule.ruleType === 'SCREEN_TYPE' && priceRule.screenType) {
      return `Phòng ${priceRule.screenType}`;
   }
   if (priceRule.ruleType === 'TIME_SLOT' && priceRule.timeFrom && priceRule.timeTo) {
      const timeFrom: string = toClock(priceRule.timeFrom);
      const timeTo: string = toClock(priceRule.timeTo);
      const crossesMidnight: boolean = timeFrom > timeTo;
      return `Bắt đầu từ ${timeFrom} đến ${timeTo}${crossesMidnight ? ' (qua nửa đêm)' : ''}`;
   }
   return PRICE_DAY_TYPE_LABELS[priceRule.dayType];
}

export function describeValidity(priceRule: PriceRule): string | null {
   if (priceRule.validFrom && priceRule.validTo) {
      return `${formatDisplayDate(priceRule.validFrom)} – ${formatDisplayDate(priceRule.validTo)}`;
   }
   if (priceRule.validFrom) {
      return `Từ ${formatDisplayDate(priceRule.validFrom)}`;
   }
   if (priceRule.validTo) {
      return `Đến ${formatDisplayDate(priceRule.validTo)}`;
   }
   return null;
}
