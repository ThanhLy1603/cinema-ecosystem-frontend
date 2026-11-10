import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { isValidDate, isValidMonth } from '@/lib/common/vietnamTime';
import { parsePositiveInteger } from '../utils/selectionParams';

export interface ShowtimeSelectionParams {
   monthParam: string | null;
   dateParam: string | null;
   cinemaId: number | null;
   showtimeId: number | null;
   updateParams: (changes: Record<string, string | null>) => void;
}

function applyParam(searchParams: URLSearchParams, paramName: string, paramValue: string | null): void {
   if (paramValue === null || paramValue === '') {
      searchParams.delete(paramName);
   } else {
      searchParams.set(paramName, paramValue);
   }
}

export function useShowtimeSelectionParams(): ShowtimeSelectionParams {
   const [searchParams, setSearchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
   const rawMonth: string = searchParams.get('month') ?? '';
   const rawDate: string = searchParams.get('date') ?? '';

   function updateParams(changes: Record<string, string | null>): void {
      const nextSearchParams: URLSearchParams = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([paramName, paramValue]) => applyParam(nextSearchParams, paramName, paramValue));
      setSearchParams(nextSearchParams, { replace: true });
   }

   return {
      monthParam: isValidMonth(rawMonth) ? rawMonth : null,
      dateParam: isValidDate(rawDate) ? rawDate : null,
      cinemaId: parsePositiveInteger(searchParams.get('cinema')),
      showtimeId: parsePositiveInteger(searchParams.get('showtime')),
      updateParams,
   };
}
