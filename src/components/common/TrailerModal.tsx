import { X } from 'lucide-react';
import { useEffect, type ReactElement } from 'react';

import type { TrailerSource } from '@/lib/trailer';

interface TrailerModalProps {
   movieTitle: string;
   trailerSource: TrailerSource;
   onClose: () => void;
}

function registerEscapeListener(onClose: () => void): () => void {
   function handleKeyDown(keyboardEvent: KeyboardEvent): void {
      if (keyboardEvent.key === 'Escape') {
         onClose();
      }
   }
   document.addEventListener('keydown', handleKeyDown);
   return function removeEscapeListener(): void {
      document.removeEventListener('keydown', handleKeyDown);
   };
}

export function TrailerModal({ movieTitle, trailerSource, onClose }: TrailerModalProps): ReactElement {
   useEffect((): (() => void) => registerEscapeListener(onClose), [onClose]);

   return (
      <div
         role="dialog"
         aria-modal="true"
         aria-label={`Trailer phim ${movieTitle}`}
         className="fixed inset-0 z-50 grid place-items-center bg-ink-900/80 p-4"
         onClick={onClose}
      >
         <div className="relative w-full max-w-4xl" onClick={(mouseEvent) => mouseEvent.stopPropagation()}>
            <button
               type="button"
               onClick={onClose}
               aria-label="Đóng trailer"
               className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
               <X className="size-5" aria-hidden="true" />
            </button>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-soft">
               {trailerSource.kind === 'video' ? (
                  <video src={trailerSource.url} controls autoPlay className="size-full" />
               ) : (
                  <iframe
                     src={trailerSource.url}
                     title={`Trailer phim ${movieTitle}`}
                     allow="autoplay; encrypted-media; picture-in-picture"
                     allowFullScreen
                     className="size-full"
                  />
               )}
            </div>
         </div>
      </div>
   );
}

export default TrailerModal;
