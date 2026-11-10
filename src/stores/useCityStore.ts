import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { persist } from 'zustand/middleware';

interface CityState {
   city: string;
   setCity: (city: string) => void;
}

export const useCityStore: UseBoundStore<StoreApi<CityState>> = create<CityState>()(
   persist(
      (set) => ({
         city: '',
         setCity(city: string): void {
            set({ city });
         },
      }),
      { name: 'cinema-selected-city' },
   ),
);
