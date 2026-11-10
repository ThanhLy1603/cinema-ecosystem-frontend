import { X } from 'lucide-react';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/common/utils';

interface SidePanelProps {
   id: string;
   title: string;
   onClose: () => void;
   children: ReactNode;
   widthClassName?: string;
}

export function SidePanel({ id, title, onClose, children, widthClassName = 'max-w-md' }: SidePanelProps): ReactElement {
   useEffect((): (() => void) => {
      function handleKeyDown(keyboardEvent: KeyboardEvent): void {
         if (keyboardEvent.key === 'Escape') {
            onClose();
         }
      }
      window.addEventListener('keydown', handleKeyDown);
      return (): void => window.removeEventListener('keydown', handleKeyDown);
   }, [onClose]);

   return (
      <div className="fixed inset-0 z-50 flex justify-end">
         <button
            type="button"
            aria-label="Đóng biểu mẫu"
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/30 backdrop-blur-xs"
         />
         <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            className={cn('relative z-10 flex h-full w-full flex-col bg-white shadow-soft', widthClassName)}
         >
            <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
               <h2 id={`${id}-title`} className="text-[15px] font-semibold text-ink-900">
                  {title}
               </h2>
               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
               >
                  <X className="size-5" aria-hidden="true" />
               </button>
            </header>
            {children}
         </section>
      </div>
   );
}

export default SidePanel;
