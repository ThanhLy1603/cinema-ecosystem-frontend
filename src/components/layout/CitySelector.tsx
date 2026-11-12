import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import { getPublicCities } from '@/api/cinemaApi';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { PUBLIC_CITIES_KEY } from '@/lib/cinema/cinemaQueryKeys';
import { useCityStore } from '@/stores/useCityStore';

const ALL_CITIES_LABEL: string = 'Toàn quốc';

export function CitySelector(): ReactElement {
   const city: string = useCityStore((cityState) => cityState.city);
   const setCity: (city: string) => void = useCityStore((cityState) => cityState.setCity);
   const citiesQuery: UseQueryResult<string[]> = useQuery<string[]>({
      queryKey: PUBLIC_CITIES_KEY,
      queryFn: getPublicCities,
   });
   const cityOptions: SelectOption[] = [
      { value: '', label: ALL_CITIES_LABEL },
      ...(citiesQuery.data ?? []).map((cityName) => ({ value: cityName, label: cityName })),
   ];

   return (
      <div className="relative w-56">
         <MapPin
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-ink-700"
            aria-hidden="true"
         />
         <SelectField
            id="header-city"
            label="Chọn tỉnh/thành phố"
            hideLabel
            value={city}
            onChange={setCity}
            options={cityOptions}
            placeholder={ALL_CITIES_LABEL}
            triggerClassName="h-10 rounded-xl border-transparent bg-ink-100/80 pl-9 text-[13px] font-semibold shadow-none text-ink-800"
            menuClassName="right-0 w-60"
         />
      </div>
   );
}

export default CitySelector;
