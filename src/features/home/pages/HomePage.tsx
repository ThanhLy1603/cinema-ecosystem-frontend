import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicCinemas } from '@/api/cinema/cinemaApi';
import { getPublicFnbMenu } from '@/api/fnb/fnbApi';
import { searchPublicMovies } from '@/api/movie/movieApi';
import { publicCinemaListKey } from '@/lib/cinema/cinemaQueryKeys';
import { PUBLIC_FNB_KEY } from '@/lib/fnb/fnbQueryKeys';
import { publicMovieListKey } from '@/lib/movie/movieQueryKeys';
import { useCityStore } from '@/stores/useCityStore';
import type { Cinema } from '@/types/cinema/cinema';
import type { PageResponse } from '@/types/common/api';
import type { FnbMenu } from '@/types/fnb/fnb';
import type { Movie, MovieSearchParams } from '@/types/movie/movie';
import HeroFallback from '../components/HeroFallback';
import HomeCombos from '../components/HomeCombos';
import HomeHero from '../components/HomeHero';
import HomeMovieSection from '../components/HomeMovieSection';
import HomePromotions from '../components/HomePromotions';
import HomeSchedule from '../components/HomeSchedule';
import { HomeLeftRail, HomeRightRail } from '../components/HomeSideRails';

const NOW_SHOWING_PAGE_SIZE: number = 6;
const COMING_SOON_PAGE_SIZE: number = 6;
const MAX_HERO_SLIDES: number = 5;

const NOW_SHOWING_PARAMS: MovieSearchParams = { status: 'NOW_SHOWING', page: 0, size: NOW_SHOWING_PAGE_SIZE };
const COMING_SOON_PARAMS: MovieSearchParams = { status: 'COMING_SOON', page: 0, size: COMING_SOON_PAGE_SIZE };

export function HomePage(): ReactElement {
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
   const fnbMenuQuery: UseQueryResult<FnbMenu> = useQuery<FnbMenu>({
      queryKey: PUBLIC_FNB_KEY,
      queryFn: getPublicFnbMenu,
   });

   const nowShowingMovies: Movie[] = nowShowingQuery.data?.content ?? [];
   const comingSoonMovies: Movie[] = comingSoonQuery.data?.content ?? [];
   const heroMovies: Movie[] = (nowShowingMovies.length > 0 ? nowShowingMovies : comingSoonMovies).slice(
      0,
      MAX_HERO_SLIDES,
   );

   const sideRailMovie: Movie | undefined = comingSoonMovies[0] ?? nowShowingMovies[nowShowingMovies.length - 1];

   return (
      <>
         {heroMovies.length > 0 ? <HomeHero movies={heroMovies} /> : <HeroFallback />}
         <div className="mx-auto w-full max-w-[1800px] xl:grid xl:grid-cols-[12rem_minmax(0,1fr)_12rem] xl:gap-6 xl:px-6 2xl:grid-cols-[14rem_minmax(0,1fr)_14rem] 2xl:gap-8">
            <HomeLeftRail movie={sideRailMovie} />
            <div className="min-w-0">
               <HomeMovieSection
                  sectionId="now-showing-section"
                  title="Phim đang chiếu"
                  movies={nowShowingMovies}
                  isLoading={nowShowingQuery.isPending}
                  columns={3}
                  emptyMessage="Hiện chưa có phim nào đang chiếu."
                  viewAllTo="/movies"
               />
               <HomeCombos fnbCombos={fnbMenuQuery.data?.combos ?? []} />
               <HomePromotions />
               <HomeMovieSection
                  sectionId="coming-soon-section"
                  title="Phim sắp chiếu"
                  movies={comingSoonMovies}
                  isLoading={comingSoonQuery.isPending}
                  columns={3}
                  emptyMessage="Hiện chưa có phim sắp chiếu."
                  viewAllTo="/movies?status=COMING_SOON"
                  hideWhenEmpty
               />
               <HomeSchedule cinemas={cinemasQuery.data ?? []} />
            </div>
            <HomeRightRail fnbCombos={fnbMenuQuery.data?.combos ?? []} />
         </div>
      </>
   );
}

export default HomePage;
