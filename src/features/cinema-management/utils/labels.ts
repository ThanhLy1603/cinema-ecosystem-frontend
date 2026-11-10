import type { SelectOption } from '@/components/ui/SelectField';
import type { CinemaStatus, HallStatus, ScreenType } from '@/types/cinema/cinema';

export const CINEMA_STATUS_LABELS: Record<CinemaStatus, string> = {
   ACTIVE: 'Đang hoạt động',
   INACTIVE: 'Tạm ngưng',
};

export const HALL_STATUS_LABELS: Record<HallStatus, string> = {
   ACTIVE: 'Đang hoạt động',
   MAINTENANCE: 'Bảo trì',
};

export const DELETED_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Đang sử dụng' },
   { value: 'true', label: 'Đã xóa' },
];

export const SCREEN_TYPES: ScreenType[] = ['2D', '3D', 'IMAX', '4DX'];

export const SCREEN_TYPE_OPTIONS: SelectOption[] = SCREEN_TYPES.map((screenType) => ({
   value: screenType,
   label: screenType,
}));

export const CINEMA_STATUS_OPTIONS: SelectOption[] = [
   { value: 'ACTIVE', label: CINEMA_STATUS_LABELS.ACTIVE },
   { value: 'INACTIVE', label: CINEMA_STATUS_LABELS.INACTIVE },
];

export const CINEMA_STATUS_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Mọi trạng thái' },
   ...CINEMA_STATUS_OPTIONS,
];

export const HALL_STATUS_OPTIONS: SelectOption[] = [
   { value: 'ACTIVE', label: HALL_STATUS_LABELS.ACTIVE },
   { value: 'MAINTENANCE', label: HALL_STATUS_LABELS.MAINTENANCE },
];
