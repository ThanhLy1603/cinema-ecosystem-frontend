import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function wait(milliseconds: number): Promise<void> {
   return new Promise<void>((resolve): void => {
      setTimeout(resolve, milliseconds);
   });
}

export function cn(...classValues: ClassValue[]): string {
   return twMerge(clsx(classValues));
}
