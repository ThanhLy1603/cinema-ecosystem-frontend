import { useEffect, useRef, useState, type RefObject } from 'react';

const VISIBILITY_THRESHOLD: number = 0.12;

export function useInView<ElementType extends Element>(): [RefObject<ElementType | null>, boolean] {
   const elementRef = useRef<ElementType | null>(null);
   const [isInView, setIsInView] = useState<boolean>(() => typeof IntersectionObserver === 'undefined');

   useEffect((): (() => void) | undefined => {
      const element: ElementType | null = elementRef.current;
      if (element === null || typeof IntersectionObserver === 'undefined') {
         return undefined;
      }

      function handleIntersection(entries: IntersectionObserverEntry[]): void {
         if (entries.some((entry) => entry.isIntersecting)) {
            setIsInView(true);
            intersectionObserver.disconnect();
         }
      }

      const intersectionObserver: IntersectionObserver = new IntersectionObserver(handleIntersection, {
         threshold: VISIBILITY_THRESHOLD,
      });
      intersectionObserver.observe(element);

      function handleCleanup(): void {
         intersectionObserver.disconnect();
      }

      return handleCleanup;
   }, []);

   return [elementRef, isInView];
}
