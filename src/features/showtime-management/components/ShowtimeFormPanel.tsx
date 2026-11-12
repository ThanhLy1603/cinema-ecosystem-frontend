import { useMutation, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { Ban, CalendarClock, Copy, Save, X } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { cancelShowtime, createShowtime, updateShowtime } from '@/api/showtime/showtimeApi';
import ShowtimePriceTable from '@/components/common/ShowtimePriceTable';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorData, getErrorMessage, getFieldErrors } from '@/lib/common/apiError';
import { parseMoneyInput } from '@/lib/common/moneyInput';
import { formatDuration } from '@/lib/movie/movieFormat';
import { MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import {
   addMinutesToInstant,
   isValidDate,
   isValidTimeOfDay,
   toVietnamDate,
   toVietnamInstant,
   toVietnamTimeOfDay,
} from '@/lib/common/vietnamTime';
import type { Hall } from '@/types/cinema/cinema';
import type { ShowtimePrice } from '@/types/showtime/pricing';
import type { MovieInfo, Showtime, ShowtimeConflict, ShowtimeRequest } from '@/types/showtime/showtime';
import { getSuggestedStartTime } from '../utils/conflictSuggestion';
import { useShowtimePricePreview } from '../hooks/useShowtimePricePreview';
import { CLEANING_MINUTES } from '../utils/labels';
import { hasErrors, validateShowtimeForm, type ShowtimeFormErrors, type ShowtimeFormValues } from '../utils/validation';
import ShowtimeColorLegend from './ShowtimeColorLegend';
import ShowtimeConflictList from './ShowtimeConflictList';
import type { AttemptedSlot } from './ShowtimeTimeline';

export type ShowtimePanelState =
   { mode: 'create'; hallId: string; date: string; startTime: string } | { mode: 'edit'; showtime: Showtime };

interface ShowtimeFormPanelProps {
   panelState: ShowtimePanelState;
   halls: Hall[];
   movieInfos: MovieInfo[];
   showtimeConflicts: ShowtimeConflict[];
   onConflict: (showtimeConflicts: ShowtimeConflict[], attemptedSlot: AttemptedSlot) => void;
   onClearConflict: () => void;
   onDuplicate: (showtime: Showtime) => void;
   onSaved: (showtime: Showtime, message: string) => void;
   onClose: () => void;
}

interface SaveVariables {
   showtimeRequest: ShowtimeRequest;
   attemptedSlot: AttemptedSlot;
}

interface SlotPreview {
   endTime: string;
   occupiedUntil: string;
}

const SHOWTIME_CONFLICT_ERROR_CODE: string = 'SHOWTIME_CONFLICT';

function buildInitialValues(panelState: ShowtimePanelState): ShowtimeFormValues {
   if (panelState.mode === 'create') {
      return {
         hallId: panelState.hallId,
         movieId: '',
         date: panelState.date,
         startTime: panelState.startTime,
         basePrice: '',
      };
   }
   const showtime: Showtime = panelState.showtime;
   return {
      hallId: String(showtime.hallId),
      movieId: String(showtime.movieId),
      date: toVietnamDate(showtime.startTime),
      startTime: toVietnamTimeOfDay(showtime.startTime),
      basePrice: String(showtime.basePrice),
   };
}

function buildMovieLabel(movieInfo: MovieInfo): string {
   const statusSuffix: string = movieInfo.status === 'COMING_SOON' ? ` · ${MOVIE_STATUS_LABELS.COMING_SOON}` : '';
   return `${movieInfo.title} (${movieInfo.rated}) · ${formatDuration(movieInfo.durationMinutes)}${statusSuffix}`;
}

function computeSlotPreview(
   showtimeFormValues: ShowtimeFormValues,
   movieInfo: MovieInfo | undefined,
): SlotPreview | null {
   if (!movieInfo || !isValidDate(showtimeFormValues.date) || !isValidTimeOfDay(showtimeFormValues.startTime)) {
      return null;
   }
   const startIsoInstant: string = toVietnamInstant(showtimeFormValues.date, showtimeFormValues.startTime);
   const endTime: string = addMinutesToInstant(startIsoInstant, movieInfo.durationMinutes);
   return { endTime, occupiedUntil: addMinutesToInstant(endTime, CLEANING_MINUTES) };
}

function buildMovieOptions(movieInfos: MovieInfo[], editingShowtime: Showtime | null): SelectOption[] {
   const movieOptions: SelectOption[] = movieInfos.map((movieInfo) => ({
      value: String(movieInfo.id),
      label: buildMovieLabel(movieInfo),
   }));
   if (editingShowtime && !movieInfos.some((movieInfo) => movieInfo.id === editingShowtime.movieId)) {
      const editedMovieLabel: string = `${editingShowtime.movieTitle} (${editingShowtime.rated}) · ${formatDuration(editingShowtime.movieDurationMinutes)}`;
      return [{ value: String(editingShowtime.movieId), label: editedMovieLabel }, ...movieOptions];
   }
   return movieOptions;
}

export function ShowtimeFormPanel({
   panelState,
   halls,
   movieInfos,
   showtimeConflicts,
   onConflict,
   onClearConflict,
   onDuplicate,
   onSaved,
   onClose,
}: ShowtimeFormPanelProps): ReactElement {
   const [showtimeFormValues, setShowtimeFormValues] = useState<ShowtimeFormValues>(() =>
      buildInitialValues(panelState),
   );
   const [showtimeFormErrors, setShowtimeFormErrors] = useState<ShowtimeFormErrors>({});
   const [isConfirmingCancel, setIsConfirmingCancel] = useState<boolean>(false);
   const editingShowtime: Showtime | null = panelState.mode === 'edit' ? panelState.showtime : null;
   const isReadOnly: boolean = editingShowtime !== null && !editingShowtime.editable;
   const selectedMovieInfo: MovieInfo | undefined = movieInfos.find(
      (movieInfo) => String(movieInfo.id) === showtimeFormValues.movieId,
   );
   const slotPreview: SlotPreview | null = computeSlotPreview(showtimeFormValues, selectedMovieInfo);
   const pricePreviewQuery: UseQueryResult<ShowtimePrice> = useShowtimePricePreview(showtimeFormValues, halls);
   const attemptedStartTime: string | null =
      slotPreview && isValidDate(showtimeFormValues.date) && isValidTimeOfDay(showtimeFormValues.startTime)
         ? toVietnamInstant(showtimeFormValues.date, showtimeFormValues.startTime)
         : null;
   const suggestedStartTime: string | null =
      attemptedStartTime && showtimeConflicts.length > 0
         ? getSuggestedStartTime(showtimeConflicts, attemptedStartTime)
         : null;

   const hallOptions: SelectOption[] = halls
      .filter((hall) => hall.status === 'ACTIVE' || hall.id === editingShowtime?.hallId)
      .map((hall) => ({ value: String(hall.id), label: `${hall.name} · ${hall.screenType}` }));
   const movieOptions: SelectOption[] = buildMovieOptions(movieInfos, editingShowtime);

   function closeOnEscape(): () => void {
      function handleKeyDown(keyboardEvent: KeyboardEvent): void {
         if (keyboardEvent.key === 'Escape') {
            onClose();
         }
      }
      window.addEventListener('keydown', handleKeyDown);
      return (): void => window.removeEventListener('keydown', handleKeyDown);
   }
   useEffect(closeOnEscape, [onClose]);

   function handleSaveError(error: unknown, saveVariables: SaveVariables): void {
      const responseConflicts: ShowtimeConflict[] | null = getErrorData<ShowtimeConflict[]>(
         error,
         SHOWTIME_CONFLICT_ERROR_CODE,
      );
      if (responseConflicts) {
         onConflict(responseConflicts, saveVariables.attemptedSlot);
         return;
      }
      setShowtimeFormErrors(getFieldErrors(error) as ShowtimeFormErrors);
   }

   const saveMutation: UseMutationResult<Showtime, unknown, SaveVariables> = useMutation<
      Showtime,
      unknown,
      SaveVariables
   >({
      mutationFn: (saveVariables) =>
         editingShowtime
            ? updateShowtime(editingShowtime.id, saveVariables.showtimeRequest)
            : createShowtime(saveVariables.showtimeRequest),
      onSuccess: (savedShowtime) =>
         onSaved(savedShowtime, editingShowtime ? 'Đã cập nhật suất chiếu' : 'Đã tạo suất chiếu mới'),
      onError: handleSaveError,
   });

   const cancelMutation: UseMutationResult<Showtime, unknown, number> = useMutation<Showtime, unknown, number>({
      mutationFn: cancelShowtime,
      onSuccess: (cancelledShowtime) => onSaved(cancelledShowtime, 'Đã hủy suất chiếu'),
   });

   function updateField(fieldName: keyof ShowtimeFormValues, fieldValue: string): void {
      setShowtimeFormValues({ ...showtimeFormValues, [fieldName]: fieldValue });
      setShowtimeFormErrors({ ...showtimeFormErrors, [fieldName]: undefined });
      if (fieldName !== 'basePrice') {
         onClearConflict();
      }
   }

   function applySuggestedStartTime(suggestedIsoInstant: string): void {
      setShowtimeFormValues({
         ...showtimeFormValues,
         date: toVietnamDate(suggestedIsoInstant),
         startTime: toVietnamTimeOfDay(suggestedIsoInstant),
      });
      onClearConflict();
   }

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const nextShowtimeFormErrors: ShowtimeFormErrors = validateShowtimeForm(showtimeFormValues);
      setShowtimeFormErrors(nextShowtimeFormErrors);
      const basePrice: number | null = parseMoneyInput(showtimeFormValues.basePrice);
      if (hasErrors(nextShowtimeFormErrors) || basePrice === null || !slotPreview) {
         return;
      }
      const startTime: string = toVietnamInstant(showtimeFormValues.date, showtimeFormValues.startTime);
      const hallId: number = Number(showtimeFormValues.hallId);
      saveMutation.mutate({
         showtimeRequest: { movieId: Number(showtimeFormValues.movieId), hallId, startTime, basePrice },
         attemptedSlot: { hallId, startTime, endTime: slotPreview.endTime, occupiedUntil: slotPreview.occupiedUntil },
      });
   }

   const endsOnNextDay: boolean =
      slotPreview !== null &&
      isValidDate(showtimeFormValues.date) &&
      toVietnamDate(slotPreview.endTime) !== showtimeFormValues.date;

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
            aria-labelledby="showtime-form-title"
            className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-soft"
         >
            <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
               <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                     <CalendarClock className="size-5" aria-hidden="true" />
                  </span>
                  <h2 id="showtime-form-title" className="text-[15px] font-semibold text-ink-900">
                     {editingShowtime ? 'Chi tiết suất chiếu' : 'Thêm suất chiếu'}
                  </h2>
               </div>
               <div className="flex items-center gap-2">
                  {editingShowtime && editingShowtime.status === 'ACTIVE' && (
                     <Button
                        variant="secondary"
                        className="h-9 px-3"
                        icon={<Copy className="size-4" aria-hidden="true" />}
                        onClick={() => onDuplicate(editingShowtime)}
                     >
                        Nhân bản / lặp lại
                     </Button>
                  )}
                  <button
                     type="button"
                     onClick={onClose}
                     aria-label="Đóng"
                     className="grid size-9 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  >
                     <X className="size-5" aria-hidden="true" />
                  </button>
               </div>
            </header>

            <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
               <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                  {showtimeConflicts.length > 0 && (
                     <ShowtimeConflictList
                        showtimeConflicts={showtimeConflicts}
                        suggestedStartTime={suggestedStartTime}
                        onUseSuggestedStartTime={applySuggestedStartTime}
                     />
                  )}
                  {saveMutation.isError && showtimeConflicts.length === 0 && (
                     <Alert variant="error">{getErrorMessage(saveMutation.error)}</Alert>
                  )}
                  {cancelMutation.isError && <Alert variant="error">{getErrorMessage(cancelMutation.error)}</Alert>}
                  {isReadOnly && editingShowtime && (
                     <Alert variant="info">
                        {editingShowtime.hasBookings
                           ? 'Suất chiếu đã có vé hoặc ghế đang được giữ nên không thể chỉnh sửa.'
                           : 'Suất chiếu đã bắt đầu hoặc đã kết thúc nên không thể chỉnh sửa.'}
                     </Alert>
                  )}

                  <SelectField
                     id="showtime-hall"
                     label="Phòng chiếu"
                     value={showtimeFormValues.hallId}
                     onChange={(hallId) => updateField('hallId', hallId)}
                     options={hallOptions}
                     error={showtimeFormErrors.hallId}
                     disabled={isReadOnly}
                     placeholder="Chọn phòng chiếu"
                  />
                  <SelectField
                     id="showtime-movie"
                     label="Phim"
                     value={showtimeFormValues.movieId}
                     onChange={(movieId) => updateField('movieId', movieId)}
                     options={movieOptions}
                     error={showtimeFormErrors.movieId}
                     disabled={isReadOnly}
                     placeholder="Chọn phim"
                  />
                  <ShowtimeColorLegend movieInfos={movieInfos} selectedMovieId={selectedMovieInfo?.id ?? null} />
                  <div className="grid gap-4 sm:grid-cols-2">
                     <TextField
                        id="showtime-date"
                        label="Ngày chiếu"
                        type="date"
                        value={showtimeFormValues.date}
                        onChange={(date) => updateField('date', date)}
                        error={showtimeFormErrors.date}
                        disabled={isReadOnly}
                     />
                     <TextField
                        id="showtime-start-time"
                        label="Giờ bắt đầu"
                        type="time"
                        value={showtimeFormValues.startTime}
                        onChange={(startTime) => updateField('startTime', startTime)}
                        error={showtimeFormErrors.startTime}
                        disabled={isReadOnly}
                     />
                  </div>
                  <TextField
                     id="showtime-base-price"
                     label="Giá vé gốc (VNĐ)"
                     value={showtimeFormValues.basePrice}
                     onChange={(basePrice) => updateField('basePrice', basePrice)}
                     error={showtimeFormErrors.basePrice}
                     hint="Chưa gồm phụ thu loại ghế, khung giờ, ngày lễ/cuối tuần."
                     placeholder="90000"
                     disabled={isReadOnly}
                  />

                  <div className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700 ring-1 ring-ink-100">
                     {slotPreview && selectedMovieInfo ? (
                        <ul className="space-y-1">
                           <li>
                              Phim chiếu <strong>{formatDuration(selectedMovieInfo.durationMinutes)}</strong>, kết thúc
                              lúc <strong>{toVietnamTimeOfDay(slotPreview.endTime)}</strong>
                              {endsOnNextDay && ' (sang ngày hôm sau)'}.
                           </li>
                           <li>
                              Phòng sẵn sàng cho suất kế tiếp từ{' '}
                              <strong>{toVietnamTimeOfDay(slotPreview.occupiedUntil)}</strong> (đã gồm{' '}
                              {CLEANING_MINUTES} phút dọn phòng).
                           </li>
                        </ul>
                     ) : (
                        <p>Chọn phim, ngày và giờ để xem giờ kết thúc và thời điểm phòng sẵn sàng trở lại.</p>
                     )}
                  </div>

                  {pricePreviewQuery.data && (
                     <div className="space-y-2">
                        <h3 className="text-sm font-extrabold text-ink-900">Bảng giá vé dự kiến</h3>
                        <ShowtimePriceTable showtimePrice={pricePreviewQuery.data} />
                     </div>
                  )}

                  {editingShowtime?.cancellable && (
                     <div className="space-y-3 border-t border-ink-100 pt-5">
                        <p className="text-sm text-ink-600">
                           Hủy suất chiếu sẽ nhả phòng cho suất khác. Không thể hủy khi suất đã có vé hoặc ghế đang được
                           giữ.
                        </p>
                        {!isConfirmingCancel ? (
                           <Button
                              variant="secondary"
                              icon={<Ban className="size-4" aria-hidden="true" />}
                              onClick={() => setIsConfirmingCancel(true)}
                           >
                              Hủy suất chiếu
                           </Button>
                        ) : (
                           <div className="flex flex-wrap gap-3">
                              <Button
                                 isLoading={cancelMutation.isPending}
                                 onClick={() => cancelMutation.mutate(editingShowtime.id)}
                              >
                                 Xác nhận hủy suất
                              </Button>
                              <Button variant="ghost" onClick={() => setIsConfirmingCancel(false)}>
                                 Không hủy
                              </Button>
                           </div>
                        )}
                     </div>
                  )}
               </div>

               <footer className="flex items-center justify-end gap-3 border-t border-ink-100 px-6 py-4">
                  <Button variant="ghost" onClick={onClose}>
                     Đóng
                  </Button>
                  {!isReadOnly && (
                     <Button
                        type="submit"
                        isLoading={saveMutation.isPending}
                        icon={<Save className="size-4" aria-hidden="true" />}
                     >
                        {editingShowtime ? 'Lưu thay đổi' : 'Tạo suất chiếu'}
                     </Button>
                  )}
               </footer>
            </form>
         </section>
      </div>
   );
}

export default ShowtimeFormPanel;
