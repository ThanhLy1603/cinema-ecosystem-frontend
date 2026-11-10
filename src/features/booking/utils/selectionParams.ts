export function parsePositiveInteger(value: string | null): number | null {
   if (value === null) {
      return null;
   }
   const parsedNumber: number = Number(value);
   return Number.isInteger(parsedNumber) && parsedNumber > 0 ? parsedNumber : null;
}

export const MAX_MONTHS_AHEAD: number = 6;
