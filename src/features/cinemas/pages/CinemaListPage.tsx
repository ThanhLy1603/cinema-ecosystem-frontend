import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicCinemas, getPublicCities } from '@/api/cinemaApi';
import PageBanner from '@/components/common/PageBanner';
import Alert from '@/components/ui/Alert';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { getErrorMessage } from '@/lib/common/apiError';
import { PUBLIC_CITIES_KEY, publicCinemaListKey } from '@/lib/cinema/cinemaQueryKeys';
import { useCityStore } from '@/stores/useCityStore';
import type { Cinema } from '@/types/cinema/cinema';
import CinemaCard from '../components/CinemaCard';

const ALL_CITIES_LABEL: string = 'Tất cả tỉnh/thành';

export function CinemaListPage(): ReactElement {
   const city: string = useCityStore((cityState) => cityState.city);
   const setCity: (city: string) => void = useCityStore((cityState) => cityState.setCity);
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

   return (
      <>
         <PageBanner
            title="Hệ thống rạp chiếu"
            description="Chọn tỉnh/thành phố để xem các cụm rạp, tiện ích đi kèm và sơ đồ ghế từng phòng chiếu."
         />
         <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
            <div className="max-w-sm">
               <SelectField
                  id="public-city-filter"
                  label="Tỉnh/Thành phố"
                  value={city}
                  onChange={setCity}
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
      </>
   );
}

export default CinemaListPage;
