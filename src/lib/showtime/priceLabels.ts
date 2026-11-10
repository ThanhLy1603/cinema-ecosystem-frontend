import type { SelectOption } from '@/components/ui/SelectField';
import type { ScreenType } from '@/types/cinema/cinema';
import type { PriceDayType, PriceRuleType } from '@/types/showtime/pricing';

export const PRICE_RULE_TYPES: PriceRuleType[] = ['TIME_SLOT', 'DAY_TYPE', 'SCREEN_TYPE'];

export const PRICE_RULE_TYPE_LABELS: Record<PriceRuleType, string> = {
   TIME_SLOT: 'Khung giờ',
   DAY_TYPE: 'Cuối tuần / ngày lễ',
   SCREEN_TYPE: 'Loại phòng',
};

export const PRICE_RULE_TYPE_DESCRIPTIONS: Record<PriceRuleType, string> = {
   TIME_SLOT: 'Cộng thêm khi giờ bắt đầu suất chiếu rơi vào khung giờ (vd. suất đêm từ 22:00).',
   DAY_TYPE: 'Cộng thêm theo ngày chiếu: ngày thường, cuối tuần hoặc ngày lễ có khoảng ngày cụ thể.',
   SCREEN_TYPE: 'Cộng thêm cho phòng chiếu đặc biệt như IMAX, 4DX.',
};

export const PRICE_DAY_TYPE_LABELS: Record<PriceDayType, string> = {
   ALL: 'Mọi ngày',
   WEEKDAY: 'Ngày thường (T2 – T6)',
   WEEKEND: 'Cuối tuần (T7, CN)',
   HOLIDAY: 'Ngày lễ',
};

export const SELECTABLE_DAY_TYPES: PriceDayType[] = ['WEEKEND', 'HOLIDAY', 'WEEKDAY'];

export const SCREEN_TYPES: ScreenType[] = ['2D', '3D', 'IMAX', '4DX'];

export const PRICE_RULE_TYPE_OPTIONS: SelectOption[] = PRICE_RULE_TYPES.map((priceRuleType) => ({
   value: priceRuleType,
   label: PRICE_RULE_TYPE_LABELS[priceRuleType],
}));

export const PRICE_DAY_TYPE_OPTIONS: SelectOption[] = SELECTABLE_DAY_TYPES.map((priceDayType) => ({
   value: priceDayType,
   label: PRICE_DAY_TYPE_LABELS[priceDayType],
}));

export const SCREEN_TYPE_OPTIONS: SelectOption[] = SCREEN_TYPES.map((screenType) => ({
   value: screenType,
   label: `Phòng ${screenType}`,
}));
