import {
   validateOptionalHttpsUrl,
   validateOptionalText,
   validateRequiredSelection,
   validateRequiredText,
} from '@/lib/formValidation';

const MIN_DURATION_MINUTES: number = 1;
const MAX_DURATION_MINUTES: number = 600;
const MAX_GENRES: number = 10;
const MAX_CASTS: number = 60;
const URL_MAX_LENGTH: number = 500;

export interface MovieFieldErrors {
   title?: string;
   originalTitle?: string;
   durationMinutes?: string;
   releaseDate?: string;
   endDate?: string;
   rated?: string;
   status?: string;
   posterUrl?: string;
   bannerUrl?: string;
   trailerUrl?: string;
   description?: string;
   genreIds?: string;
   casts?: string;
}

export interface CastDraftValue {
   personId: string;
   roleType: string;
}

export function hasMovieFieldErrors(movieFieldErrors: MovieFieldErrors): boolean {
   return Object.values(movieFieldErrors).some((message) => message !== undefined);
}

export function validateDuration(durationText: string): string | undefined {
   const trimmedText: string = durationText.trim();
   if (trimmedText.length === 0) {
      return 'Vui lòng nhập thời lượng';
   }
   const durationMinutes: number = Number(trimmedText);
   if (!Number.isInteger(durationMinutes)) {
      return 'Thời lượng phải là số phút nguyên';
   }
   return durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES
      ? `Thời lượng phải từ ${MIN_DURATION_MINUTES} đến ${MAX_DURATION_MINUTES} phút`
      : undefined;
}

export function validateEndDate(releaseDate: string, endDate: string): string | undefined {
   if (endDate.length === 0 || releaseDate.length === 0) {
      return undefined;
   }
   return endDate < releaseDate ? 'Ngày kết thúc chiếu phải sau hoặc bằng ngày khởi chiếu' : undefined;
}

export function validateCasts(castDraftValues: CastDraftValue[]): string | undefined {
   if (castDraftValues.length > MAX_CASTS) {
      return `Mỗi phim tối đa ${MAX_CASTS} nghệ sĩ`;
   }
   if (castDraftValues.some((castDraftValue) => castDraftValue.personId === '' || castDraftValue.roleType === '')) {
      return 'Mỗi dòng nghệ sĩ cần chọn người và vai trò';
   }
   const castKeys: Set<string> = new Set<string>(
      castDraftValues.map((castDraftValue) => `${castDraftValue.personId}:${castDraftValue.roleType}`),
   );
   return castKeys.size === castDraftValues.length
      ? undefined
      : 'Một nghệ sĩ không thể giữ cùng một vai trò hai lần trong phim';
}

export interface MovieFormValues {
   title: string;
   originalTitle: string;
   durationText: string;
   releaseDate: string;
   endDate: string;
   rated: string;
   status: string;
   posterUrl: string;
   bannerUrl: string;
   trailerUrl: string;
   description: string;
   genreIds: number[];
   castDraftValues: CastDraftValue[];
}

export function validateMovieForm(movieFormValues: MovieFormValues): MovieFieldErrors {
   return {
      title: validateRequiredText(movieFormValues.title, 'Vui lòng nhập tên phim', 255),
      originalTitle: validateOptionalText(movieFormValues.originalTitle, 255),
      durationMinutes: validateDuration(movieFormValues.durationText),
      releaseDate: validateRequiredSelection(movieFormValues.releaseDate, 'Vui lòng chọn ngày khởi chiếu'),
      endDate: validateEndDate(movieFormValues.releaseDate, movieFormValues.endDate),
      rated: validateRequiredSelection(movieFormValues.rated, 'Vui lòng chọn nhãn độ tuổi'),
      status: validateRequiredSelection(movieFormValues.status, 'Vui lòng chọn trạng thái'),
      posterUrl: validateOptionalHttpsUrl(movieFormValues.posterUrl, URL_MAX_LENGTH),
      bannerUrl: validateOptionalHttpsUrl(movieFormValues.bannerUrl, URL_MAX_LENGTH),
      trailerUrl: validateOptionalHttpsUrl(movieFormValues.trailerUrl, URL_MAX_LENGTH),
      description: validateOptionalText(movieFormValues.description, 5000),
      genreIds: movieFormValues.genreIds.length > MAX_GENRES ? `Mỗi phim tối đa ${MAX_GENRES} thể loại` : undefined,
      casts: validateCasts(movieFormValues.castDraftValues),
   };
}
