import { Clapperboard } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { restoreMovie } from '@/api/movie/movieApi';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import RestoreButton from '@/components/common/RestoreButton';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import type { Movie } from '@/types/movie/movie';
import MovieStatusBadge from './MovieStatusBadge';

interface MovieTableProps {
   movies: Movie[];
   canRestore: boolean;
   onRestored: () => void;
}

export function MovieTable({ movies, canRestore, onRestored }: MovieTableProps): ReactElement {
   if (movies.length === 0) {
      return (
         <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-200/80">
            Không có phim nào phù hợp với bộ lọc.
         </p>
      );
   }

   return (
      <div className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-ink-200/80">
         <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/80 text-[11px] uppercase tracking-wider text-ink-500">
               <tr>
                  <th className="px-4 py-2.5 font-semibold">Phim</th>
                  <th className="px-4 py-2.5 font-semibold">Độ tuổi</th>
                  <th className="px-4 py-2.5 font-semibold">Thời lượng</th>
                  <th className="px-4 py-2.5 font-semibold">Khởi chiếu</th>
                  <th className="px-4 py-2.5 font-semibold">Thể loại</th>
                  <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                  <th className="px-4 py-2.5" />
               </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
               {movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-ink-50/60">
                     <td className="max-w-[300px] px-4 py-3">
                        <div className="flex items-center gap-3">
                           {movie.posterUrl ? (
                              <img
                                 src={movie.posterUrl}
                                 alt=""
                                 className="h-14 w-10 shrink-0 rounded-md object-cover"
                              />
                           ) : (
                              <span className="grid h-14 w-10 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-300">
                                 <Clapperboard className="size-5" aria-hidden="true" />
                              </span>
                           )}
                           <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900">{movie.title}</p>
                              {movie.originalTitle && (
                                 <p className="truncate text-xs text-ink-500">{movie.originalTitle}</p>
                              )}
                           </div>
                        </div>
                     </td>
                     <td className="px-4 py-3">
                        <AgeRatingBadge ageRating={movie.rated} />
                     </td>
                     <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                        {formatDuration(movie.durationMinutes)}
                     </td>
                     <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                        {formatReleaseDate(movie.releaseDate)}
                     </td>
                     <td className="max-w-[200px] truncate px-4 py-3 text-ink-700">
                        {movie.genres.length === 0 ? '—' : movie.genres.map((genre) => genre.name).join(', ')}
                     </td>
                     <td className="px-4 py-3">
                        <MovieStatusBadge movieStatus={movie.status} isDeleted={movie.deleted} />
                     </td>
                     <td className="whitespace-nowrap px-4 py-3 text-right">
                        {movie.deleted ? (
                           canRestore && (
                              <RestoreButton restore={() => restoreMovie(movie.id)} onRestored={onRestored} />
                           )
                        ) : (
                           <Link
                              to={`/admin/movies/${movie.id}`}
                              className="font-semibold text-brand-700 hover:underline"
                           >
                              Chỉnh sửa
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

export default MovieTable;
