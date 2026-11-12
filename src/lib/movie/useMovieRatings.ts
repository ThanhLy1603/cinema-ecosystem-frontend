import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getMovieRatingSummaries } from '@/api/movie/movieApi';
import type { MovieRatingSummary } from '@/types/movie/movie';
import { movieRatingSummariesKey } from './movieQueryKeys';

const RATINGS_STALE_MILLISECONDS: number = 2 * 60 * 1000;

export function useMovieRatings(movieIds: number[]): ReadonlyMap<number, MovieRatingSummary> {
   const ratingsQuery: UseQueryResult<MovieRatingSummary[]> = useQuery<MovieRatingSummary[]>({
      queryKey: movieRatingSummariesKey(movieIds),
      queryFn: () => getMovieRatingSummaries(movieIds),
      enabled: movieIds.length > 0,
      staleTime: RATINGS_STALE_MILLISECONDS,
      placeholderData: keepPreviousData,
      retry: false,
   });
   const movieRatingSummaries: Map<number, MovieRatingSummary> = new Map<number, MovieRatingSummary>();
   for (const movieRatingSummary of ratingsQuery.data ?? []) {
      movieRatingSummaries.set(movieRatingSummary.movieId, movieRatingSummary);
   }
   return movieRatingSummaries;
}
