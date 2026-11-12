import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import type { MovieInfo } from '@/types/showtime/showtime';
import { CLEANING_BACKGROUND, getMovieSwatchClasses } from '../utils/timeline';

interface ShowtimeColorLegendProps {
   movieInfos: MovieInfo[];
   selectedMovieId: number | null;
}

export function ShowtimeColorLegend({ movieInfos, selectedMovieId }: ShowtimeColorLegendProps): ReactElement {
   return (
      <div className="space-y-3 rounded-xl border border-ink-200 bg-ink-50/60 p-3">
         <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Màu phim trên lịch chiếu</p>
            {movieInfos.length === 0 ? (
               <p className="mt-1.5 text-xs text-ink-500">Chưa có phim nào để chiếu.</p>
            ) : (
               <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto pr-1">
                  {movieInfos.map((movieInfo) => (
                     <li
                        key={movieInfo.id}
                        className={cn(
                           'flex items-center gap-2 text-xs text-ink-700',
                           movieInfo.id === selectedMovieId && 'font-extrabold text-ink-900',
                        )}
                     >
                        <span
                           aria-hidden="true"
                           className={cn('size-4 shrink-0 rounded border-2', getMovieSwatchClasses(movieInfo.id))}
                        />
                        <span className="truncate">{movieInfo.title}</span>
                     </li>
                  ))}
               </ul>
            )}
         </div>
         <div className="border-t border-ink-200 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Màu đặc biệt</p>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
               <li className="flex items-center gap-2">
                  <span
                     aria-hidden="true"
                     className="size-4 shrink-0 rounded border-2 border-danger-500 bg-danger-100"
                  />
                  Suất đang bị trùng giờ
               </li>
               <li className="flex items-center gap-2">
                  <span
                     aria-hidden="true"
                     className="size-4 shrink-0 rounded border border-ink-300"
                     style={{ backgroundImage: CLEANING_BACKGROUND }}
                  />
                  15 phút dọn phòng sau mỗi suất
               </li>
               <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-4 w-0.5 shrink-0 bg-danger-500" />
                  Giờ hiện tại (chỉ hiện ở ngày hôm nay)
               </li>
            </ul>
         </div>
      </div>
   );
}

export default ShowtimeColorLegend;
