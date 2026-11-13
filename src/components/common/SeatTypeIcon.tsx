import type { ReactElement } from 'react';
import { SEAT_CELL_HEIGHT, SEAT_CELL_WIDTH } from '@/lib/cinema/seatMap';
import SeatIcon from './SeatIcon';

interface SeatTypeIconProps {
   seatTypeCode: string | null;
   className?: string;
}

export function SeatTypeIcon({ seatTypeCode, className }: SeatTypeIconProps): ReactElement {
   return (
      <svg viewBox={`0 0 ${SEAT_CELL_WIDTH} ${SEAT_CELL_HEIGHT}`} className={className} aria-hidden="true">
         <SeatIcon x={0} y={0} width={SEAT_CELL_WIDTH} seatTypeCode={seatTypeCode ?? 'STANDARD'} />
      </svg>
   );
}

export default SeatTypeIcon;
