import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicCinemas } from '@/api/cinemaApi';
import { searchPublicMovies } from '@/api/movieApi';
import Reveal from '@/components/common/Reveal';
import LinkButton from '@/components/ui/LinkButton';
import { publicCinemaListKey } from '@/lib/cinema/cinemaQueryKeys';
import { publicMovieListKey } from '@/lib/movie/movieQueryKeys';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCityStore } from '@/stores/useCityStore';
import type { PageResponse } from '@/types/common/api';
import type { Cinema } from '@/types/cinema/cinema';
import type { Movie, MovieSearchParams } from '@/types/movie/movie';
import type { User } from '@/types/auth/auth';
import BenefitStrip from '../components/BenefitStrip';
import CinemaHighlights from '../components/CinemaHighlights';
import HeroCarousel from '../components/HeroCarousel';
import HeroFallback from '../components/HeroFallback';
import MovieShowcase from '../components/MovieShowcase';
import QuickBookingBar from '../components/QuickBookingBar';

const NOW_SHOWING_PAGE_SIZE: number = 10;
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
         <QuickBookingBar movies={nowShowingMovies} cinemas={cinemasQuery.data ?? []} />
         <MovieShowcase
            nowShowingMovies={nowShowingMovies}
            comingSoonMovies={comingSoonMovies}
            isLoading={nowShowingQuery.isPending || comingSoonQuery.isPending}
         />
         <CinemaHighlights cinemas={cinemasQuery.data ?? []} />
         <BenefitStrip />

         {!user && (
            <section aria-label="Đăng ký thành viên" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-12">
               <Reveal>
                  <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl px-8 py-8 shadow-glow [background:var(--cta-bg)]">
                     <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white">Trở thành thành viên CinemaSphere</h2>
                        <p className="text-sm text-white/75">
                           Đặt vé nhanh hơn, tích điểm mỗi giao dịch và nhận ưu đãi dành riêng cho thành viên.
                        </p>
                     </div>
                     <div className="flex flex-wrap gap-3">
                        <LinkButton to="/register" size="lg" variant="light">
                           Đăng ký ngay
                        </LinkButton>
                        <LinkButton
                           to="/login"
                           size="lg"
                           variant="ghost"
                           className="text-white hover:bg-white/10 hover:text-white"
                        >
                           Tôi đã có tài khoản
                        </LinkButton>
                     </div>
                  </div>
               </Reveal>
            </section>
         )}
      </>
   );
}

export default HomePage;
