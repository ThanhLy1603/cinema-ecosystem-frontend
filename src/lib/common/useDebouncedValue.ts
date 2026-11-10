import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMilliseconds: number): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);

   function scheduleUpdate(): () => void {
      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(
         (): void => setDebouncedValue(value),
         delayMilliseconds,
      );
      return (): void => clearTimeout(timeoutId);
   }
   useEffect(scheduleUpdate, [value, delayMilliseconds]);

   return debouncedValue;
}
