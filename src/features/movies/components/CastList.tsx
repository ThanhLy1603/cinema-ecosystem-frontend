import { UserRound } from 'lucide-react';
import type { ReactElement } from 'react';
import { CAST_ROLE_LABELS } from '@/lib/movie/movieLabels';
import type { MovieCast } from '@/types/movie/movie';

interface CastListProps {
   movieCasts: MovieCast[];
}

export function CastList({ movieCasts }: CastListProps): ReactElement {
   return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {movieCasts.map((movieCast) => (
            <li
               key={`${movieCast.personId}-${movieCast.roleType}`}
               className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink-100"
            >
               {movieCast.avatarUrl ? (
                  <img
                     src={movieCast.avatarUrl}
                     alt=""
                     loading="lazy"
                     className="size-12 shrink-0 rounded-full object-cover"
                  />
               ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-400">
                     <UserRound className="size-6" aria-hidden="true" />
                  </span>
               )}
               <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{movieCast.personName}</p>
                  <p className="truncate text-xs text-ink-500">
                     {CAST_ROLE_LABELS[movieCast.roleType]}
                     {movieCast.characterName ? ` · vai ${movieCast.characterName}` : ''}
                  </p>
               </div>
            </li>
         ))}
      </ul>
   );
}

export default CastList;
