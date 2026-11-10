import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { listAdminShowtimes } from '@/api/showtimeApi';
import { listHalls } from '@/api/hallApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { useCinemaOptions } from '@/lib/cinema/useCinemaOptions';
import {
   addDaysToDate,
   formatDisplayDate,
   getWeekdayLabel,
   isValidDate,
   toVietnamDate,
   todayInVietnam,
} from '@/lib/common/vietnamTime';
import type { CinemaOption, Hall } from '@/types/cinema/cinema';
import type { MovieInfo, Showtime, ShowtimeConflict } from '@/types/showtime/showtime';
import ShowtimeFormPanel, { type ShowtimePanelState } from '../components/ShowtimeFormPanel';
import ShowtimeTimeline, { type AttemptedSlot } from '../components/ShowtimeTimeline';
import { useSchedulableMovies } from '../hooks/useSchedulableMovies';
import { useShowtimeRefresh } from '../hooks/useShowtimeRefresh';
import { adminShowtimeHallsKey, adminShowtimeListKey } from '../utils/queryKeys';

interface ConflictState {
   showtimeConflicts: ShowtimeConflict[];
   attemptedSlot: AttemptedSlot;
}

const HALLS_STALE_TIME_MS: number = 30 * 1000;
const DEFAULT_START_TIME: string = '09:00';

export function ShowtimeManagementPage(): ReactElement {
   const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
   const [selectedDate, setSelectedDate] = useState<string>(todayInVietnam);
   const [panelState, setPanelState] = useState<ShowtimePanelState | null>(null);
   const [conflictState, setConflictState] = useState<ConflictState | null>(null);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const refreshShowtimes: () => void = useShowtimeRefresh();

   const cinemaOptionsQuery: UseQueryResult<CinemaOption[]> = useCinemaOptions();
   const cinemaOptions: CinemaOption[] = cinemaOptionsQuery.data ?? [];
   const effectiveCinemaId: string = selectedCinemaId ?? (cinemaOptions.length > 0 ? String(cinemaOptions[0].id) : '');
   const cinemaId: number | null = effectiveCinemaId === '' ? null : Number(effectiveCinemaId);

   const hallsQuery: UseQueryResult<Hall[]> = useQuery<Hall[]>({
      queryKey: adminShowtimeHallsKey(cinemaId ?? 0),
      queryFn: () => listHalls(cinemaId ?? 0, false),
      enabled: cinemaId !== null,
      staleTime: HALLS_STALE_TIME_MS,
   });
   const showtimesQuery: UseQueryResult<Showtime[]> = useQuery<Showtime[]>({
      queryKey: adminShowtimeListKey(cinemaId ?? 0, selectedDate),
      queryFn: () => listAdminShowtimes({ cinemaId: cinemaId ?? 0, date: selectedDate, status: 'ACTIVE' }),
      enabled: cinemaId !== null && isValidDate(selectedDate),
   });
   const moviesQuery: UseQueryResult<MovieInfo[]> = useSchedulableMovies();

   const halls: Hall[] = hallsQuery.data ?? [];
   const showtimes: Showtime[] = showtimesQuery.data ?? [];
   const movieInfos: MovieInfo[] = moviesQuery.data ?? [];
   const conflictShowtimeIds: ReadonlySet<number> = new Set(
      (conflictState?.showtimeConflicts ?? []).map((showtimeConflict) => showtimeConflict.showtimeId),
   );
   const cinemaSelectOptions: SelectOption[] = cinemaOptions.map((cinemaOption) => ({
      value: String(cinemaOption.id),
      label: `${cinemaOption.name} · ${cinemaOption.city}`,
   }));
   const hasBookableHall: boolean = halls.some((hall) => hall.status === 'ACTIVE');

   function changeCinema(nextCinemaId: string): void {
      setSelectedCinemaId(nextCinemaId);
      setConflictState(null);
      setSuccessMessage(null);
   }

   function changeDate(nextDate: string): void {
      setSelectedDate(nextDate);
      setConflictState(null);
      setSuccessMessage(null);
   }

   function openCreatePanel(hallId: string, startTime: string): void {
      setSuccessMessage(null);
      setConflictState(null);
      setPanelState({ mode: 'create', hallId, date: selectedDate, startTime });
   }

   function handleCreateFromToolbar(): void {
      const firstBookableHall: Hall | undefined = halls.find((hall) => hall.status === 'ACTIVE');
      openCreatePanel(firstBookableHall ? String(firstBookableHall.id) : '', DEFAULT_START_TIME);
   }

   function handleCreateFromTimeline(hallId: number, timeOfDay: string): void {
      openCreatePanel(String(hallId), timeOfDay);
   }

   function handleSelectShowtime(showtime: Showtime): void {
      setSuccessMessage(null);
      setConflictState(null);
      setPanelState({ mode: 'edit', showtime });
   }

   function handleConflict(showtimeConflicts: ShowtimeConflict[], attemptedSlot: AttemptedSlot): void {
      setConflictState({ showtimeConflicts, attemptedSlot });
      setSelectedDate(toVietnamDate(attemptedSlot.startTime));
   }

   function handleClearConflict(): void {
      setConflictState(null);
   }

   function handleSaved(savedShowtime: Showtime, message: string): void {
      setPanelState(null);
      setConflictState(null);
      setSuccessMessage(message);
      setSelectedDate(toVietnamDate(savedShowtime.startTime));
      refreshShowtimes();
   }

   function handleClosePanel(): void {
      setPanelState(null);
      setConflictState(null);
   }

   return (
      <div className="w-full max-w-7xl space-y-6">
         <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Quản lý suất chiếu</h1>
               <p className="mt-1 text-sm text-ink-500">
                  Xếp lịch chiếu theo phòng. Hai suất liên tiếp trong cùng phòng phải cách nhau tối thiểu 15 phút dọn
                  phòng.
               </p>
            </div>
            <Button
               onClick={handleCreateFromToolbar}
               disabled={cinemaId === null || !hasBookableHall}
               icon={<Plus className="size-4" aria-hidden="true" />}
            >
               Thêm suất chiếu
            </Button>
         </header>

         <div className="grid gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <SelectField
               id="showtime-cinema-filter"
               label="Cụm rạp"
               value={effectiveCinemaId}
               onChange={changeCinema}
               options={cinemaSelectOptions}
               placeholder="Chọn cụm rạp"
            />
            <div className="flex flex-wrap items-end gap-3">
               <Button
                  variant="secondary"
                  aria-label="Ngày trước"
                  onClick={() => changeDate(addDaysToDate(selectedDate, -1))}
                  disabled={!isValidDate(selectedDate)}
                  icon={<ChevronLeft className="size-4" aria-hidden="true" />}
               />
               <div className="w-44">
                  <TextField
                     id="showtime-date-filter"
                     label="Ngày chiếu"
                     type="date"
                     value={selectedDate}
                     onChange={changeDate}
                  />
               </div>
               <Button
                  variant="secondary"
                  aria-label="Ngày sau"
                  onClick={() => changeDate(addDaysToDate(selectedDate, 1))}
                  disabled={!isValidDate(selectedDate)}
                  icon={<ChevronRight className="size-4" aria-hidden="true" />}
               />
               <Button variant="ghost" onClick={() => changeDate(todayInVietnam())}>
                  Hôm nay
               </Button>
            </div>
         </div>

         {isValidDate(selectedDate) && (
            <p className="text-sm font-semibold text-ink-700">
               {getWeekdayLabel(selectedDate)}, {formatDisplayDate(selectedDate)}
               {showtimesQuery.data && ` · ${showtimes.length} suất chiếu · ${halls.length} phòng`}
            </p>
         )}

         {successMessage && <Alert variant="success">{successMessage}</Alert>}
         {cinemaOptionsQuery.isError && <Alert variant="error">{getErrorMessage(cinemaOptionsQuery.error)}</Alert>}
         {hallsQuery.isError && <Alert variant="error">{getErrorMessage(hallsQuery.error)}</Alert>}
         {showtimesQuery.isError && <Alert variant="error">{getErrorMessage(showtimesQuery.error)}</Alert>}
         {moviesQuery.isError && <Alert variant="error">{getErrorMessage(moviesQuery.error)}</Alert>}
         {!cinemaOptionsQuery.isPending && cinemaOptions.length === 0 && (
            <Alert variant="info">Bạn chưa được phân công cụm rạp nào hoặc hệ thống chưa có cụm rạp hoạt động.</Alert>
         )}
         {cinemaOptions.length > 0 && cinemaId === null && (
            <Alert variant="info">Vui lòng chọn cụm rạp để xem lịch chiếu.</Alert>
         )}
         {!isValidDate(selectedDate) && <Alert variant="info">Vui lòng chọn ngày chiếu hợp lệ.</Alert>}

         {cinemaId !== null && hallsQuery.data && hallsQuery.data.length === 0 && (
            <div className="space-y-3 rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-ink-100">
               <p className="text-sm text-ink-600">Cụm rạp này chưa có phòng chiếu để xếp lịch.</p>
               <LinkButton to={`/admin/cinemas/${cinemaId}`} variant="secondary">
                  Mở trang cụm rạp để thêm phòng
               </LinkButton>
            </div>
         )}

         {cinemaId !== null && halls.length > 0 && isValidDate(selectedDate) && (
            <>
               <ShowtimeTimeline
                  date={selectedDate}
                  halls={halls}
                  showtimes={showtimes}
                  conflictShowtimeIds={conflictShowtimeIds}
                  attemptedSlot={conflictState?.attemptedSlot ?? null}
                  selectedShowtimeId={panelState?.mode === 'edit' ? panelState.showtime.id : null}
                  onSelectShowtime={handleSelectShowtime}
                  onCreateAt={handleCreateFromTimeline}
               />
               <p className="text-xs text-ink-500">
                  Bấm vào vùng trống của một phòng để thêm suất chiếu tại giờ đó, bấm vào suất chiếu để xem, sửa hoặc
                  hủy. Vùng sọc xám sau mỗi suất là 15 phút dọn phòng.
               </p>
            </>
         )}
         {showtimesQuery.isPending && cinemaId !== null && (
            <p className="text-sm text-ink-500">Đang tải lịch chiếu...</p>
         )}

         {panelState && (
            <ShowtimeFormPanel
               key={panelState.mode === 'edit' ? `edit-${panelState.showtime.id}` : 'create'}
               panelState={panelState}
               halls={halls}
               movieInfos={movieInfos}
               showtimeConflicts={conflictState?.showtimeConflicts ?? []}
               onConflict={handleConflict}
               onClearConflict={handleClearConflict}
               onSaved={handleSaved}
               onClose={handleClosePanel}
            />
         )}
      </div>
   );
}

export default ShowtimeManagementPage;
