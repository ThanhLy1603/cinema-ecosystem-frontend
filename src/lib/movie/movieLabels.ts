import type { SelectOption } from '@/components/ui/SelectField';
import type { AgeRating, CastRoleType, MovieStatus } from '@/types/movie';

export const AGE_RATINGS: AgeRating[] = ['P', 'C13', 'C16', 'C18'];

export const AGE_RATING_DESCRIPTIONS: Record<AgeRating, string> = {
   P: 'Phổ biến, mọi lứa tuổi',
   C13: 'Cấm khán giả dưới 13 tuổi',
   C16: 'Cấm khán giả dưới 16 tuổi',
   C18: 'Cấm khán giả dưới 18 tuổi',
};

export const AGE_RATING_WARNINGS: Record<AgeRating, string | null> = {
   P: null,
   C13: 'Phim phổ biến đến người xem từ đủ 13 tuổi trở lên (T13). Khán giả dưới 13 tuổi không được vào xem.',
   C16: 'Phim phổ biến đến người xem từ đủ 16 tuổi trở lên (T16). Khán giả dưới 16 tuổi không được vào xem.',
   C18: 'Phim chỉ phổ biến đến người xem từ đủ 18 tuổi trở lên (T18). Khán giả dưới 18 tuổi không được vào xem.',
};

export const AGE_RATING_BADGE_CLASSES: Record<AgeRating, string> = {
   P: 'bg-emerald-600 text-white',
   C13: 'bg-amber-400 text-ink-900',
   C16: 'bg-orange-500 text-white',
   C18: 'bg-danger-600 text-white',
};

export const MOVIE_STATUSES: MovieStatus[] = ['NOW_SHOWING', 'COMING_SOON', 'ENDED'];

export const MOVIE_STATUS_LABELS: Record<MovieStatus, string> = {
   NOW_SHOWING: 'Đang chiếu',
   COMING_SOON: 'Sắp chiếu',
   ENDED: 'Ngừng chiếu',
};

export const CAST_ROLE_LABELS: Record<CastRoleType, string> = {
   DIRECTOR: 'Đạo diễn',
   ACTOR: 'Diễn viên',
   PRODUCER: 'Nhà sản xuất',
};

export const AGE_RATING_OPTIONS: SelectOption[] = AGE_RATINGS.map((ageRating) => ({
   value: ageRating,
   label: `${ageRating} - ${AGE_RATING_DESCRIPTIONS[ageRating]}`,
}));

export const AGE_RATING_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Mọi độ tuổi' },
   ...AGE_RATINGS.map((ageRating) => ({ value: ageRating, label: ageRating })),
];

export const MOVIE_STATUS_OPTIONS: SelectOption[] = MOVIE_STATUSES.map((movieStatus) => ({
   value: movieStatus,
   label: MOVIE_STATUS_LABELS[movieStatus],
}));

export const MOVIE_STATUS_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Mọi trạng thái' },
   ...MOVIE_STATUS_OPTIONS,
];

export const CAST_ROLE_OPTIONS: SelectOption[] = (Object.keys(CAST_ROLE_LABELS) as CastRoleType[]).map(
   (castRoleType) => ({ value: castRoleType, label: CAST_ROLE_LABELS[castRoleType] }),
);
