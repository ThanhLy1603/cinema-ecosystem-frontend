import type { ShowtimeConflictType } from '@/types/showtime/showtime';

export const CONFLICT_TYPE_LABELS: Record<ShowtimeConflictType, string> = {
   OVERLAP: 'Trùng giờ chiếu',
   CLEANING_TIME: 'Chưa đủ 15 phút dọn phòng',
};

export const CLEANING_MINUTES: number = 15;
