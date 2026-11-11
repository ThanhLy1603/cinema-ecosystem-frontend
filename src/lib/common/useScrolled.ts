import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD_PIXELS: number = 8;

export function useScrolled(): boolean {
   const [isScrolled, setIsScrolled] = useState<boolean>(() => window.scrollY > SCROLL_THRESHOLD_PIXELS);

   useEffect((): (() => void) => {
      function handleScroll(): void {
         setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PIXELS);
      }

      window.addEventListener('scroll', handleScroll, { passive: true });

      function handleCleanup(): void {
         window.removeEventListener('scroll', handleScroll);
      }

      return handleCleanup;
   }, []);

   return isScrolled;
}
