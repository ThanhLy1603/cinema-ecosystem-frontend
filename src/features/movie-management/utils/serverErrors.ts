import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/common/apiError';

const SLUG_CONFLICT_ERROR_CODE: string = 'MOVIE_SLUG_EXISTS';

export function getMovieServerFieldErrors(error: unknown): Record<string, string> {
   if (getErrorCode(error) === SLUG_CONFLICT_ERROR_CODE) {
      return { slug: getErrorMessage(error) };
   }
   return getFieldErrors(error);
}
