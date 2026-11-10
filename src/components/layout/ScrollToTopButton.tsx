import { ChevronUp } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

const SHOW_AFTER_SCROLL_PX: number = 480;

function watchScroll(onChange: (isVisible: boolean) => void): () => void {
   function handleScroll(): void {
      onChange(window.scrollY > SHOW_AFTER_SCROLL_PX);
   }
   handleScroll();
   window.addEventListener('scroll', handleScroll, { passive: true });
   return function stopWatching(): void {
      window.removeEventListener('scroll', handleScroll);
   };
}

export function ScrollToTopButton(): ReactElement | null {
   const [isVisible, setIsVisible] = useState<boolean>(false);

   useEffect((): (() => void) => watchScroll(setIsVisible), []);

   if (!isVisible) {
      return null;
   }

   return (
      <button
         type="button"
         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         aria-label="Lên đầu trang"
         className="fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-glow transition-all hover:-translate-y-1 hover:bg-brand-700"
      >
         <ChevronUp className="size-6" aria-hidden="true" />
      </button>
   );
}

export default ScrollToTopButton;
