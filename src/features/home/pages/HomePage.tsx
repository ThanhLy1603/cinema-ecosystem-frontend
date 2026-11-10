import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicCinemas } from '@/api/cinemaApi';
import { getPublicGenres, searchPublicMovies } from '@/api/movieApi';
import LinkButton from '@/components/ui/LinkButton';
import { publicCinemaListKey } from '@/lib/cinemaQueryKeys';
import { PUBLIC_GENRES_KEY, publicMovieListKey } from '@/lib/movieQueryKeys';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCityStore } from '@/stores/useCityStore';
import type { PageResponse } from '@/types/api';
import type { Cinema } from '@/types/cinema';
import type { Genre, Movie, MovieSearchParams } from '@/types/movie';
import type { User } from '@/types/auth';
import BenefitStrip from '../components/BenefitStrip';
import CinemaHighlights from '../components/CinemaHighlights';
import HeroCarousel from '../components/HeroCarousel';
import HeroFallback from '../components/HeroFallback';
import MovieSection from '../components/MovieSection';
import QuickSearchBar from '../components/QuickSearchBar';

const NOW_SHOWING_PAGE_SIZE: number = 15;
const COMING_SOON_PAGE_SIZE: number = 10;
const HERO_SLIDE_COUNT: number = 5;

const NOW_SHOWING_PARAMS: MovieSearchParams = { status: 'NOW_SHOWING', page: 0, size: NOW_SHOWING_PAGE_SIZE };
const COMING_SOON_PARAMS: MovieSearchParams = { status: 'COMING_SOON', page: 0, size: COMING_SOON_PAGE_SIZE };

export function HomePage(): ReactElement {
   const user: User | null = useAuthStore((authState) => authState.user);
   const city: string = useCityStore((cityState) => cityState.city);
   const nowShowingQuery: UseQueryResult<PageResponse<Movie>> = useQuery<PageResponse<Movie>>({
      queryKey: publicMovieListKey(NOW_SHOWING_PARAMS),
      queryFn: () => searchPublicMovies(NOW_SHOWING_PARAMS),
   });
   const comingSoonQuery: UseQueryResult<PageResponse<Movie>> = useQuery<PageResponse<Movie>>({
      queryKey: publicMovieListKey(COMING_SOON_PARAMS),
      queryFn: () => searchPublicMovies(COMING_SOON_PARAMS),
   });
   const genresQuery: UseQueryResult<Genre[]> = useQuery<Genre[]>({
      queryKey: PUBLIC_GENRES_KEY,
      queryFn: getPublicGenres,
   });
   const cinemasQuery: UseQueryResult<Cinema[]> = useQuery<Cinema[]>({
      queryKey: publicCinemaListKey(city),
      queryFn: () => getPublicCinemas(city || undefined),
   });

   const nowShowingMovies: Movie[] = nowShowingQuery.data?.content ?? [];
   const comingSoonMovies: Movie[] = comingSoonQuery.data?.content ?? [];
   const heroMovies: Movie[] = (nowShowingMovies.length > 0 ? nowShowingMovies : comingSoonMovies).slice(
      0,
      HERO_SLIDE_COUNT,
   );

   return (
      <>
         {heroMovies.length > 0 ? <HeroCarousel movies={heroMovies} /> : <HeroFallback />}
         <QuickSearchBar genres={genresQuery.data ?? []} />
         <MovieSection
            title="Phim đang chiếu"
            emptyMessage="Chưa có phim đang chiếu. Vui lòng quay lại sau."
            viewAllTo="/movies"
            movies={nowShowingMovies}
            isLoading={nowShowingQuery.isPending}
            layout="carousel"
         />
         <MovieSection
            title="Phim sắp chiếu"
            emptyMessage="Chưa có phim sắp chiếu. Vui lòng quay lại sau."
            viewAllTo="/movies?status=COMING_SOON"
            movies={comingSoonMovies}
            isLoading={comingSoonQuery.isPending}
            layout="grid"
         />
         <CinemaHighlights cinemas={cinemasQuery.data ?? []} />
         <BenefitStrip />

         {!user && (
            <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
               <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400 px-8 py-14 text-center shadow-soft sm:px-16">
                  <div className="pointer-events-none absolute -left-10 -top-10 size-56 rounded-full bg-accent-300/30 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -right-10 size-64 rounded-full bg-white/20 blur-3xl" />
                  <div className="relative space-y-6">
                     <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Sẵn sàng cho suất chiếu tiếp theo?
                     </h2>
                     <p className="mx-auto max-w-xl text-white/90">
                        Tạo tài khoản miễn phí để đặt vé nhanh hơn, tích điểm và nhận ưu đãi dành riêng cho thành viên.
                     </p>
                     <div className="flex flex-wrap justify-center gap-3">
                        <LinkButton to="/register" size="lg" variant="light">
                           Đăng ký ngay
                        </LinkButton>
                        <LinkButton
                           to="/login"
                           size="lg"
                           variant="ghost"
                           className="text-white hover:bg-white/15 hover:text-white"
                        >
                           Tôi đã có tài khoản
                        </LinkButton>
                     </div>
                  </div>
               </div>
            </section>
         )}
      </>
   );
}

export default HomePage;
