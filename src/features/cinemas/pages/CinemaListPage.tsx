import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { getPublicCinemas, getPublicCities } from '@/api/cinemaApi';
import Alert from '@/components/ui/Alert';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { getErrorMessage } from '@/lib/apiError';
import { PUBLIC_CITIES_KEY, publicCinemaListKey } from '@/lib/cinemaQueryKeys';
import type { Cinema } from '@/types/cinema';
import CinemaCard from '../components/CinemaCard';

const CITY_PARAM: string = 'city';
const ALL_CITIES_LABEL: string = 'Tất cả tỉnh/thành';

export function CinemaListPage(): ReactElement {
   const [searchParams, setSearchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
   const city: string = searchParams.get(CITY_PARAM) ?? '';
   const citiesQuery: UseQueryResult<string[]> = useQuery<string[]>({
      queryKey: PUBLIC_CITIES_KEY,
      queryFn: getPublicCities,
   });
   const cinemasQuery: UseQueryResult<Cinema[]> = useQuery<Cinema[]>({
      queryKey: publicCinemaListKey(city),
      queryFn: () => getPublicCinemas(city || undefined),
   });
   const cityOptions: SelectOption[] = [
      { value: '', label: ALL_CITIES_LABEL },
      ...(citiesQuery.data ?? []).map((cityName) => ({ value: cityName, label: cityName })),
   ];

   function handleCityChange(nextCity: string): void {
      setSearchParams(nextCity ? { [CITY_PARAM]: nextCity } : {});
   }

   return (
      <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6">
         <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Hệ thống rạp chiếu</h1>
            <p className="max-w-2xl text-ink-500">
               Chọn tỉnh/thành phố để xem các cụm rạp, tiện ích đi kèm và sơ đồ ghế từng phòng chiếu.
            </p>
         </header>

         <div className="max-w-sm">
            <SelectField
               id="public-city-filter"
               label="Tỉnh/Thành phố"
               value={city}
               onChange={handleCityChange}
               options={cityOptions}
               placeholder={ALL_CITIES_LABEL}
            />
         </div>

         {cinemasQuery.isError && <Alert variant="error">{getErrorMessage(cinemasQuery.error)}</Alert>}
         {cinemasQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách rạp...</p>}
         {cinemasQuery.data && cinemasQuery.data.length === 0 && (
            <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-100">
               Chưa có cụm rạp nào {city ? `tại ${city}` : 'trong hệ thống'}.
            </p>
         )}
         {cinemasQuery.data && cinemasQuery.data.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {cinemasQuery.data.map((cinema) => (
                  <CinemaCard key={cinema.id} cinema={cinema} />
               ))}
            </div>
         )}
      </section>
   );
}

export default CinemaListPage;
