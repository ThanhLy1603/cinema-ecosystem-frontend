import type { SelectOption } from '@/components/ui/SelectField';
import type { FnbCategory, FnbStatus } from '@/types/fnb/fnb';

export const FNB_CATEGORIES: FnbCategory[] = ['POPCORN', 'DRINK', 'SNACK'];

export const FNB_CATEGORY_LABELS: Record<FnbCategory, string> = {
   POPCORN: 'Bắp rang bơ',
   DRINK: 'Đồ uống',
   SNACK: 'Đồ ăn nhẹ',
};

export const FNB_STATUS_LABELS: Record<FnbStatus, string> = {
   AVAILABLE: 'Còn hàng',
   UNAVAILABLE: 'Hết hàng',
};

export const FNB_CATEGORY_OPTIONS: SelectOption[] = FNB_CATEGORIES.map((fnbCategory) => ({
   value: fnbCategory,
   label: FNB_CATEGORY_LABELS[fnbCategory],
}));

export const FNB_CATEGORY_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Tất cả nhóm' },
   ...FNB_CATEGORY_OPTIONS,
];

export const FNB_STATUS_OPTIONS: SelectOption[] = [
   { value: 'AVAILABLE', label: FNB_STATUS_LABELS.AVAILABLE },
   { value: 'UNAVAILABLE', label: FNB_STATUS_LABELS.UNAVAILABLE },
];

export const FNB_STATUS_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Mọi trạng thái' },
   ...FNB_STATUS_OPTIONS,
];
