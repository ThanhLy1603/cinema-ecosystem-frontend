import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { restoreCinema } from '@/api/cinemaApi';
import type { Cinema } from '@/types/cinema';
import CinemaStatusBadge from './CinemaStatusBadge';
import RestoreButton from './RestoreButton';

interface CinemaTableProps {
   cinemas: Cinema[];
   canRestore: boolean;
   onRestored: () => void;
}

export function CinemaTable({ cinemas, canRestore, onRestored }: CinemaTableProps): ReactElement {
   if (cinemas.length === 0) {
      return (
         <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-100">
            Không có cụm rạp nào phù hợp với bộ lọc.
         </p>
      );
   }

   return (
      <div className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-ink-100">
         <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
               <tr>
                  <th className="px-4 py-4 font-semibold">Cụm rạp</th>
                  <th className="px-4 py-4 font-semibold">Tỉnh/Thành phố</th>
                  <th className="px-4 py-4 font-semibold">Hotline</th>
                  <th className="px-4 py-4 text-center font-semibold">Phòng chiếu</th>
                  <th className="px-4 py-4 font-semibold">Tiện ích</th>
                  <th className="px-4 py-4 font-semibold">Trạng thái</th>
                  <th className="px-4 py-4" />
               </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
               {cinemas.map((cinema) => (
                  <tr key={cinema.id} className="hover:bg-ink-50/60">
                     <td className="max-w-[300px] px-4 py-4">
                        <p className="truncate font-semibold text-ink-900">{cinema.name}</p>
                        <p className="truncate text-xs text-ink-500">{cinema.address}</p>
                     </td>
                     <td className="whitespace-nowrap px-4 py-4 text-ink-700">{cinema.city}</td>
                     <td className="whitespace-nowrap px-4 py-4 text-ink-700">{cinema.phone ?? '—'}</td>
                     <td className="px-4 py-4 text-center text-ink-700">{cinema.hallCount}</td>
                     <td className="max-w-[200px] truncate px-4 py-4 text-ink-700">
                        {cinema.facilities.length === 0
                           ? '—'
                           : cinema.facilities.map((facility) => facility.name).join(', ')}
                     </td>
                     <td className="px-4 py-4">
                        <CinemaStatusBadge cinemaStatus={cinema.status} isDeleted={cinema.deleted} />
                     </td>
                     <td className="whitespace-nowrap px-4 py-4 text-right">
                        {cinema.deleted ? (
                           canRestore && (
                              <RestoreButton restore={() => restoreCinema(cinema.id)} onRestored={onRestored} />
                           )
                        ) : (
                           <Link
                              to={`/admin/cinemas/${cinema.id}`}
                              className="font-semibold text-brand-700 hover:underline"
                           >
                              Chi tiết
                           </Link>
                        )}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}

export default CinemaTable;
