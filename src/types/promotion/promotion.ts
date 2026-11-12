export type DiscountType = 'PERCENT' | 'FIXED_AMOUNT';

export interface PublicPromotion {
  id: number;
  code: string | null;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  startDate: string;
  endDate: string;
}
