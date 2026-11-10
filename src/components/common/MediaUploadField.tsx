import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { FileVideo, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type ReactElement } from 'react';
import { getUploadErrorMessage, getUploadSignature, validateMediaFile } from '@/api/mediaApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { toTrailerSource, type TrailerSource } from '@/lib/trailer';
import type { MediaFieldState, MediaPurpose, UploadSignature } from '@/types/media';

interface MediaUploadFieldProps {
   id: string;
   label: string;
   value: MediaFieldState;
   onChange: (mediaFieldState: MediaFieldState) => void;
   mediaPurpose: MediaPurpose;
   accept: string;
   placeholder?: string;
   error?: string;
   disabled?: boolean;
   optional?: boolean;
}

interface FilePreview {
   file: File;
   dataUrl: string;
}

const BYTES_PER_MEGABYTE: number = 1024 * 1024;

function formatFileSize(sizeBytes: number): string {
   return `${(sizeBytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;
}

function readFilePreview(
   file: File | null,
   isVideoPurpose: boolean,
   onPreviewReady: (filePreview: FilePreview) => void,
): (() => void) | undefined {
   if (file === null || isVideoPurpose) {
      return undefined;
   }
   const fileReader: FileReader = new FileReader();
   fileReader.onload = (): void => onPreviewReady({ file, dataUrl: String(fileReader.result) });
   fileReader.readAsDataURL(file);
   return (): void => fileReader.abort();
}

export function MediaUploadField({
   id,
   label,
   value,
   onChange,
   mediaPurpose,
   accept,
   placeholder = 'https://...',
   error,
   disabled = false,
   optional = false,
}: MediaUploadFieldProps): ReactElement {
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
   const isVideoPurpose: boolean = mediaPurpose === 'MOVIE_TRAILER';
   const pendingFile: File | null = value.file;

   useEffect(
      (): (() => void) | undefined => readFilePreview(pendingFile, isVideoPurpose, setFilePreview),
      [pendingFile, isVideoPurpose],
   );

   async function checkFile(file: File): Promise<File> {
      const uploadSignature: UploadSignature = await getUploadSignature(mediaPurpose);
      validateMediaFile(file, uploadSignature);
      return file;
   }

   function handleFileAccepted(acceptedFile: File): void {
      onChange({ url: value.url, file: acceptedFile });
   }

   const checkMutation: UseMutationResult<File, unknown, File> = useMutation<File, unknown, File>({
      mutationFn: checkFile,
      onSuccess: handleFileAccepted,
   });

   function handleFileChange(changeEvent: ChangeEvent<HTMLInputElement>): void {
      const selectedFile: File | undefined = changeEvent.target.files?.[0];
      changeEvent.target.value = '';
      if (selectedFile) {
         checkMutation.mutate(selectedFile);
      }
   }

   function openFilePicker(): void {
      checkMutation.reset();
      fileInputRef.current?.click();
   }

   function clearPendingFile(): void {
      setFilePreview(null);
      onChange({ url: value.url, file: null });
   }

   const trimmedUrl: string = value.url.trim();
   const trailerPreviewSource: TrailerSource | null =
      pendingFile === null && isVideoPurpose ? toTrailerSource(trimmedUrl, false) : null;
   const previewDataUrl: string | null =
      pendingFile !== null && filePreview?.file === pendingFile ? filePreview.dataUrl : null;

   return (
      <div className="space-y-3">
         {pendingFile === null ? (
            <TextField
               id={id}
               label={label}
               value={value.url}
               onChange={(url) => onChange({ url, file: null })}
               placeholder={placeholder}
               optional={optional}
               disabled={disabled}
               error={error}
            />
         ) : (
            <div className="space-y-1.5">
               <p className="flex items-baseline justify-between text-sm font-semibold text-ink-800">
                  <span>{label}</span>
                  {optional && <span className="text-xs font-normal text-ink-400">Không bắt buộc</span>}
               </p>
               <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/50 p-3">
                  {previewDataUrl ? (
                     <img src={previewDataUrl} alt={`Xem trước ${label}`} className="size-16 rounded-lg object-cover" />
                  ) : (
                     <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-white text-ink-400">
                        <FileVideo className="size-7" aria-hidden="true" />
                     </span>
                  )}
                  <div className="min-w-0 flex-1">
                     <p className="truncate text-sm font-semibold text-ink-900">{pendingFile.name}</p>
                     <p className="text-xs text-ink-500">
                        {formatFileSize(pendingFile.size)} · sẽ được tải lên khi bạn bấm lưu
                     </p>
                  </div>
                  <Button
                     variant="ghost"
                     className="h-9 px-3"
                     disabled={disabled}
                     aria-label={`Bỏ tệp đã chọn của ${label}`}
                     icon={<X className="size-4" aria-hidden="true" />}
                     onClick={clearPendingFile}
                  />
               </div>
               {error && (
                  <p role="alert" className="text-[13px] font-medium text-danger-700">
                     {error}
                  </p>
               )}
            </div>
         )}
         <div className="flex flex-wrap items-center gap-3">
            <input
               ref={fileInputRef}
               type="file"
               accept={accept}
               onChange={handleFileChange}
               className="hidden"
               aria-label={`Chọn tệp cho ${label}`}
            />
            <Button
               variant="secondary"
               className="h-10 px-4"
               disabled={disabled}
               isLoading={checkMutation.isPending}
               icon={<Upload className="size-4" aria-hidden="true" />}
               onClick={openFilePicker}
            >
               {pendingFile === null ? 'Chọn tệp từ máy' : 'Chọn tệp khác'}
            </Button>
         </div>
         {checkMutation.isError && <Alert variant="error">{getUploadErrorMessage(checkMutation.error)}</Alert>}
         {pendingFile === null && trimmedUrl.startsWith('https://') && !isVideoPurpose && (
            <img
               src={trimmedUrl}
               alt={`Xem trước ${label}`}
               className="max-h-40 rounded-xl object-contain ring-1 ring-ink-100"
            />
         )}
         {trailerPreviewSource?.kind === 'video' && (
            <video
               src={trailerPreviewSource.url}
               controls
               preload="metadata"
               className="max-h-48 rounded-xl ring-1 ring-ink-100"
            />
         )}
         {trailerPreviewSource?.kind === 'youtube' && (
            <div className="aspect-video w-full max-w-md overflow-hidden rounded-xl ring-1 ring-ink-100">
               <iframe
                  src={trailerPreviewSource.url}
                  title={`Xem trước ${label}`}
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full"
               />
            </div>
         )}
      </div>
   );
}

export default MediaUploadField;
