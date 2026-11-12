import { formatVnd } from '@/lib/common/currencyFormat';
import { formatDisplayDate, toVietnamDate } from '@/lib/common/vietnamTime';
import type { PublicPromotion } from '@/types/promotion/promotion';

export function formatDiscountValue(publicPromotion: PublicPromotion): string {
   return publicPromotion.discountType === 'PERCENT'
      ? `${Number(publicPromotion.discountValue)}%`
      : formatVnd(publicPromotion.discountValue);
}

export function describePromotionLimits(publicPromotion: PublicPromotion): string[] {
   const limits: string[] = [];
   if (publicPromotion.minOrderAmount !== null && publicPromotion.minOrderAmount > 0) {
      limits.push(`Cho đơn từ ${formatVnd(publicPromotion.minOrderAmount)}`);
   }
   if (publicPromotion.discountType === 'PERCENT' && publicPromotion.maxDiscountAmount !== null) {
      limits.push(`Giảm tối đa ${formatVnd(publicPromotion.maxDiscountAmount)}`);
   }
   return limits;
}

export function formatPromotionEndDate(publicPromotion: PublicPromotion): string {
   return `Hết hạn ${formatDisplayDate(toVietnamDate(publicPromotion.endDate))}`;
}
