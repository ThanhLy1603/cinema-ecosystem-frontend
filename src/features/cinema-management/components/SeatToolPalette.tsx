import { Eraser } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { SeatSwatch } from '@/components/common/SeatLegend';
import { MAINTENANCE_SEAT_CLASS_NAME, formatSurcharge, getSeatTypeStyle } from '@/lib/seatMap';
import { cn } from '@/lib/utils';
import type { SeatType } from '@/types/cinema';
import type { EditorTool } from '../utils/seatMapEditing';

interface SeatToolPaletteProps {
   seatTypes: SeatType[];
   editorTool: EditorTool;
   onSelect: (editorTool: EditorTool) => void;
}

interface ToolButtonProps {
   isActive: boolean;
   title: string;
   description: string;
   visual: ReactNode;
   onClick: () => void;
}

function ToolButton({ isActive, title, description, visual, onClick }: ToolButtonProps): ReactElement {
   return (
      <button
         type="button"
         aria-pressed={isActive}
         onClick={onClick}
         className={cn(
            'flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all',
            isActive
               ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100'
               : 'border-ink-200 bg-white hover:border-brand-300',
         )}
      >
         <span className="grid w-12 shrink-0 place-items-center">{visual}</span>
         <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink-900">{title}</span>
            <span className="block truncate text-xs text-ink-500">{description}</span>
         </span>
      </button>
   );
}

export function SeatToolPalette({ seatTypes, editorTool, onSelect }: SeatToolPaletteProps): ReactElement {
   return (
      <div className="space-y-2" role="group" aria-label="Công cụ vẽ sơ đồ">
         {seatTypes.map((seatType) => (
            <ToolButton
               key={seatType.code}
               isActive={editorTool.kind === 'seat' && editorTool.seatTypeCode === seatType.code}
               title={seatType.name}
               description={`${formatSurcharge(seatType.defaultSurcharge)}${seatType.span > 1 ? ` · chiếm ${seatType.span} ô` : ''}`}
               visual={
                  <SeatSwatch className={getSeatTypeStyle(seatType.code).seatClassName} widthUnits={seatType.span} />
               }
               onClick={() => onSelect({ kind: 'seat', seatTypeCode: seatType.code })}
            />
         ))}
         <ToolButton
            isActive={editorTool.kind === 'erase'}
            title="Xóa ghế / tạo lối đi"
            description="Bấm hoặc kéo qua ghế để xóa"
            visual={<Eraser className="size-5 text-ink-600" aria-hidden="true" />}
            onClick={() => onSelect({ kind: 'erase' })}
         />
         <ToolButton
            isActive={editorTool.kind === 'maintenance'}
            title="Đánh dấu bảo trì"
            description="Bấm vào ghế để bật/tắt bảo trì"
            visual={<SeatSwatch className={MAINTENANCE_SEAT_CLASS_NAME} widthUnits={1} />}
            onClick={() => onSelect({ kind: 'maintenance' })}
         />
      </div>
   );
}

export default SeatToolPalette;
