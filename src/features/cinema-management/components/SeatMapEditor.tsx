import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Grid3x3, Redo2, RotateCcw, Save, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { getSeatMap, saveSeatMap } from '@/api/hallApi';
import SeatGrid from '@/components/common/SeatGrid';
import SeatLegend from '@/components/common/SeatLegend';
import SectionCard from '@/components/common/SectionCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { MAX_SEAT_COLUMNS, MAX_SEAT_ROWS, buildRowLetters, type GridCell } from '@/lib/cinema/seatMap';
import type { SeatLayout, SeatType } from '@/types/cinema/cinema';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import { useSeatMapDraft, type SeatMapDraftController } from '../hooks/useSeatMapDraft';
import { adminSeatMapKey } from '../utils/queryKeys';
import {
   applyTool,
   applyToolToColumn,
   applyToolToRow,
   computeStatistics,
   createDraftFromLayout,
   createGridDraft,
   resizeDraft,
   serializeSeats,
   toGridSeats,
   toSeatCellRequests,
   type EditorTool,
   type SeatMapDraft,
   type SeatMapStatistics,
   type SeatTypesByCode,
} from '../utils/seatMapEditing';
import GridSizeStepper from './GridSizeStepper';
import SeatToolPalette from './SeatToolPalette';

interface SeatMapEditorProps {
   seatLayout: SeatLayout;
   seatTypes: SeatType[];
}

const DEFAULT_GENERATE_ROWS: number = 10;
const DEFAULT_GENERATE_COLUMNS: number = 10;
const SEAT_MAP_CONFLICT_CODE: string = 'SEAT_MAP_CONFLICT';
const SEAT_IN_USE_CODE: string = 'SEAT_IN_USE';

function indexSeatTypes(seatTypes: SeatType[]): SeatTypesByCode {
   const seatTypesByCode: SeatTypesByCode = {};
   for (const seatType of seatTypes) {
      seatTypesByCode[seatType.code] = seatType;
   }
   return seatTypesByCode;
}

function preserveCanvasSize(loadedSeatMapDraft: SeatMapDraft, currentSeatMapDraft: SeatMapDraft): SeatMapDraft {
   return {
      ...loadedSeatMapDraft,
      rowCount: Math.max(loadedSeatMapDraft.rowCount, currentSeatMapDraft.rowCount),
      columns: Math.max(loadedSeatMapDraft.columns, currentSeatMapDraft.columns),
   };
}

export function SeatMapEditor({ seatLayout, seatTypes }: SeatMapEditorProps): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const refreshCinema: () => void = useCinemaRefresh(seatLayout.cinemaId);
   const seatTypesByCode: SeatTypesByCode = useMemo(() => indexSeatTypes(seatTypes), [seatTypes]);
   const [savedLayout, setSavedLayout] = useState<SeatLayout>(seatLayout);
   const seatMapDraftController: SeatMapDraftController = useSeatMapDraft(createDraftFromLayout(seatLayout));
   const seatMapDraft: SeatMapDraft = seatMapDraftController.seatMapDraft;
   const [editorTool, setEditorTool] = useState<EditorTool>({
      kind: 'seat',
      seatTypeCode: seatTypes[0]?.code ?? 'STANDARD',
   });
   const [generateRows, setGenerateRows] = useState<number>(DEFAULT_GENERATE_ROWS);
   const [generateColumns, setGenerateColumns] = useState<number>(DEFAULT_GENERATE_COLUMNS);
   const [generateSeatTypeCode, setGenerateSeatTypeCode] = useState<string>(seatTypes[0]?.code ?? '');
   const [generateError, setGenerateError] = useState<string | undefined>(undefined);

   const baselineSerialized: string = useMemo(() => serializeSeats(createDraftFromLayout(savedLayout)), [savedLayout]);
   const isDirty: boolean = serializeSeats(seatMapDraft) !== baselineSerialized;
   const seatMapStatistics: SeatMapStatistics = computeStatistics(seatMapDraft);
   const rowLetters: string[] = buildRowLetters(seatMapDraft.rowCount);
   const seatTypeOptions: SelectOption[] = seatTypes.map((seatType) => ({
      value: seatType.code,
      label: seatType.name,
   }));

   function adoptLayout(nextSeatLayout: SeatLayout): void {
      setSavedLayout(nextSeatLayout);
      seatMapDraftController.reset(preserveCanvasSize(createDraftFromLayout(nextSeatLayout), seatMapDraft));
      queryClient.setQueryData(adminSeatMapKey(nextSeatLayout.hallId), nextSeatLayout);
   }

   function handleSaved(savedSeatLayout: SeatLayout): void {
      adoptLayout(savedSeatLayout);
      refreshCinema();
   }

   const saveMutation: UseMutationResult<SeatLayout, unknown, void> = useMutation<SeatLayout, unknown, void>({
      mutationFn: () =>
         saveSeatMap(seatLayout.hallId, { version: savedLayout.version, seats: toSeatCellRequests(seatMapDraft) }),
      onSuccess: handleSaved,
   });

   function handleReloaded(reloadedSeatLayout: SeatLayout): void {
      saveMutation.reset();
      adoptLayout(reloadedSeatLayout);
   }

   const reloadMutation: UseMutationResult<SeatLayout, unknown, void> = useMutation<SeatLayout, unknown, void>({
      mutationFn: () => getSeatMap(seatLayout.hallId),
      onSuccess: handleReloaded,
   });

   const isConflict: boolean = saveMutation.isError && getErrorCode(saveMutation.error) === SEAT_MAP_CONFLICT_CODE;
   const isSeatInUse: boolean = saveMutation.isError && getErrorCode(saveMutation.error) === SEAT_IN_USE_CODE;

   function handleCellPointerDown(gridCell: GridCell): void {
      saveMutation.reset();
      seatMapDraftController.beginStroke();
      seatMapDraftController.apply((currentSeatMapDraft) =>
         applyTool(currentSeatMapDraft, seatTypesByCode, editorTool, gridCell),
      );
   }

   function handleCellPointerMove(gridCell: GridCell): void {
      seatMapDraftController.apply((currentSeatMapDraft) =>
         applyTool(currentSeatMapDraft, seatTypesByCode, editorTool, gridCell),
      );
   }

   function handleRowLabelClick(row: string): void {
      seatMapDraftController.apply((currentSeatMapDraft) =>
         applyToolToRow(currentSeatMapDraft, seatTypesByCode, editorTool, row),
      );
   }

   function handleColumnLabelClick(column: number): void {
      seatMapDraftController.apply((currentSeatMapDraft) =>
         applyToolToColumn(currentSeatMapDraft, seatTypesByCode, editorTool, column),
      );
   }

   function handleResize(rowCount: number, columns: number): void {
      seatMapDraftController.apply((currentSeatMapDraft) =>
         resizeDraft(currentSeatMapDraft, seatTypesByCode, rowCount, columns),
      );
   }

   function handleGenerate(): void {
      if (generateSeatTypeCode === '') {
         setGenerateError('Vui lòng chọn loại ghế mặc định');
         return;
      }
      setGenerateError(undefined);
      seatMapDraftController.apply((currentSeatMapDraft) =>
         createGridDraft(currentSeatMapDraft, seatTypesByCode, generateRows, generateColumns, generateSeatTypeCode),
      );
   }

   function handleDiscard(): void {
      saveMutation.reset();
      seatMapDraftController.reset(preserveCanvasSize(createDraftFromLayout(savedLayout), seatMapDraft));
   }

   function handleKeyDown(keyboardEvent: KeyboardEvent): void {
      const target: HTMLElement | null = keyboardEvent.target instanceof HTMLElement ? keyboardEvent.target : null;
      const isTyping: boolean = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (isTyping || !(keyboardEvent.metaKey || keyboardEvent.ctrlKey)) {
         return;
      }
      const pressedKey: string = keyboardEvent.key.toLowerCase();
      if (pressedKey === 'z' && keyboardEvent.shiftKey) {
         keyboardEvent.preventDefault();
         seatMapDraftController.redo();
      } else if (pressedKey === 'z') {
         keyboardEvent.preventDefault();
         seatMapDraftController.undo();
      } else if (pressedKey === 'y') {
         keyboardEvent.preventDefault();
         seatMapDraftController.redo();
      }
   }

   function registerUndoShortcuts(): () => void {
      window.addEventListener('keydown', handleKeyDown);
      return (): void => window.removeEventListener('keydown', handleKeyDown);
   }
   useEffect(registerUndoShortcuts);

   function registerUnloadWarning(): (() => void) | undefined {
      if (!isDirty) {
         return undefined;
      }
      function warnBeforeUnload(beforeUnloadEvent: BeforeUnloadEvent): void {
         beforeUnloadEvent.preventDefault();
      }
      window.addEventListener('beforeunload', warnBeforeUnload);
      return (): void => window.removeEventListener('beforeunload', warnBeforeUnload);
   }
   useEffect(registerUnloadWarning, [isDirty]);

   return (
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
         <aside className="space-y-6">
            <SectionCard title="Công cụ" description="Chọn công cụ rồi bấm hoặc kéo trên sơ đồ để vẽ.">
               <SeatToolPalette seatTypes={seatTypes} editorTool={editorTool} onSelect={setEditorTool} />
               <p className="mt-4 text-xs text-ink-500">
                  Bấm chữ cái hàng hoặc số cột để áp dụng công cụ cho cả hàng/cột. Ghế đôi chiếm 2 ô liền nhau. Ghế bị
                  xóa khỏi sơ đồ vẫn được lưu lịch sử cho vé cũ; ghế còn vé hoặc lượt giữ chỗ của suất chưa chiếu thì
                  không xóa được.
               </p>
            </SectionCard>

            <SectionCard title="Kích thước lưới">
               <div className="space-y-3">
                  <GridSizeStepper
                     label="Số hàng"
                     value={seatMapDraft.rowCount}
                     minimum={1}
                     maximum={MAX_SEAT_ROWS}
                     onChange={(rowCount) => handleResize(rowCount, seatMapDraft.columns)}
                  />
                  <GridSizeStepper
                     label="Số cột"
                     value={seatMapDraft.columns}
                     minimum={1}
                     maximum={MAX_SEAT_COLUMNS}
                     onChange={(columns) => handleResize(seatMapDraft.rowCount, columns)}
                  />
               </div>
            </SectionCard>

            <SectionCard title="Tạo lưới nhanh" description="Thay toàn bộ sơ đồ bằng một lưới đầy ghế.">
               <div className="space-y-4">
                  <GridSizeStepper
                     label="Số hàng"
                     value={generateRows}
                     minimum={1}
                     maximum={MAX_SEAT_ROWS}
                     onChange={setGenerateRows}
                  />
                  <GridSizeStepper
                     label="Số cột"
                     value={generateColumns}
                     minimum={1}
                     maximum={MAX_SEAT_COLUMNS}
                     onChange={setGenerateColumns}
                  />
                  <SelectField
                     id="generate-seat-type"
                     label="Loại ghế mặc định"
                     value={generateSeatTypeCode}
                     onChange={setGenerateSeatTypeCode}
                     options={seatTypeOptions}
                     error={generateError}
                  />
                  <Button
                     variant="secondary"
                     fullWidth
                     icon={<Grid3x3 className="size-4" aria-hidden="true" />}
                     onClick={handleGenerate}
                  >
                     Tạo lưới
                  </Button>
               </div>
            </SectionCard>
         </aside>

         <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-ink-100">
               <div className="flex flex-wrap gap-2">
                  <Button
                     variant="secondary"
                     className="h-10 px-3"
                     disabled={!seatMapDraftController.canUndo}
                     icon={<Undo2 className="size-4" aria-hidden="true" />}
                     onClick={seatMapDraftController.undo}
                  >
                     Hoàn tác
                  </Button>
                  <Button
                     variant="secondary"
                     className="h-10 px-3"
                     disabled={!seatMapDraftController.canRedo}
                     icon={<Redo2 className="size-4" aria-hidden="true" />}
                     onClick={seatMapDraftController.redo}
                  >
                     Làm lại
                  </Button>
                  <Button
                     variant="ghost"
                     className="h-10 px-3"
                     disabled={!isDirty}
                     icon={<RotateCcw className="size-4" aria-hidden="true" />}
                     onClick={handleDiscard}
                  >
                     Bỏ thay đổi
                  </Button>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-sm text-ink-600">
                     <strong className="text-ink-900">{seatMapStatistics.totalSeats}</strong> ghế
                     {seatMapStatistics.maintenanceSeats > 0 && ` · ${seatMapStatistics.maintenanceSeats} bảo trì`}
                  </span>
                  <Button
                     disabled={!isDirty}
                     isLoading={saveMutation.isPending}
                     icon={<Save className="size-4" aria-hidden="true" />}
                     onClick={() => saveMutation.mutate()}
                  >
                     Lưu sơ đồ
                  </Button>
               </div>
            </div>

            {isDirty && !saveMutation.isPending && <Alert variant="info">Bạn có thay đổi chưa được lưu.</Alert>}
            {saveMutation.isSuccess && !isDirty && <Alert variant="success">Đã lưu sơ đồ ghế.</Alert>}
            {saveMutation.isError && (
               <Alert variant="error">
                  <span>{getErrorMessage(saveMutation.error)}</span>
                  {isSeatInUse && (
                     <span className="mt-1 block text-xs font-normal">
                        Dùng công cụ «Đánh dấu bảo trì» để ngừng bán những ghế này, rồi bỏ chúng khỏi sơ đồ sau khi các
                        suất chiếu liên quan đã diễn ra.
                     </span>
                  )}
                  {isConflict && (
                     <Button
                        variant="secondary"
                        className="ml-3 h-8 px-3"
                        isLoading={reloadMutation.isPending}
                        onClick={() => reloadMutation.mutate()}
                     >
                        Tải lại bản mới nhất
                     </Button>
                  )}
               </Alert>
            )}
            {reloadMutation.isError && <Alert variant="error">{getErrorMessage(reloadMutation.error)}</Alert>}

            <div className="space-y-5 rounded-3xl bg-white p-4 shadow-card ring-1 ring-ink-100 sm:p-6">
               <SeatGrid
                  rows={rowLetters}
                  columns={seatMapDraft.columns}
                  seats={toGridSeats(seatMapDraft, seatTypesByCode)}
                  ariaLabel={`Sơ đồ ghế phòng ${seatLayout.hallName}`}
                  showEmptyCells
                  onCellPointerDown={handleCellPointerDown}
                  onCellPointerMove={handleCellPointerMove}
                  onPointerEnd={seatMapDraftController.endStroke}
                  onRowLabelClick={handleRowLabelClick}
                  onColumnLabelClick={handleColumnLabelClick}
               />
               <SeatLegend seatTypes={seatTypes} showMaintenance showEmptyCell />
            </div>
         </section>
      </div>
   );
}

export default SeatMapEditor;
