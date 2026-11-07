import { Ticket } from 'lucide-react'
import type { ReactElement } from 'react'

export function FullPageSpinner(): ReactElement {
   return (
      <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Đang tải">
         <div className="flex flex-col items-center gap-4">
            <div className="relative grid size-16 place-items-center">
               <span className="absolute inset-0 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
               <Ticket className="size-6 text-brand-600" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-ink-500">Đang chuẩn bị rạp chiếu...</p>
         </div>
      </div>
   )
}

export default FullPageSpinner
