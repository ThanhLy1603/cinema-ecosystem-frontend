import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicCities } from '@/api/cinemaApi';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { PUBLIC_CITIES_KEY } from '@/lib/cinemaQueryKeys';
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
      <div className="w-44">
         <SelectField
            id="header-city"
            label="Chọn tỉnh/thành phố"
            hideLabel
            value={city}
            onChange={setCity}
            options={cityOptions}
            placeholder={ALL_CITIES_LABEL}
            triggerClassName="h-11 rounded-lg border-2 border-brand-700 pl-3 text-sm font-extrabold uppercase text-ink-900"
            menuClassName="right-0 w-60"
         />
      </div>
   );
}

export default CitySelector;
