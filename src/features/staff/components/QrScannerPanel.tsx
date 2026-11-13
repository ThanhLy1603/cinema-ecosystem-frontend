import { Camera, CameraOff, Keyboard } from 'lucide-react';
import type { FormEvent, ReactElement, RefObject } from 'react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

interface QrScannerPanelProps {
   videoRef: RefObject<HTMLVideoElement | null>;
   isCameraActive: boolean;
   cameraErrorMessage: string | null;
   onStartCamera: () => void;
   onStopCamera: () => void;
   manualCode: string;
   isBusy: boolean;
   inputContainerRef: RefObject<HTMLDivElement | null>;
   onManualCodeChange: (manualCode: string) => void;
   onManualSubmit: () => void;
}

export function QrScannerPanel({
   videoRef,
   isCameraActive,
   cameraErrorMessage,
   onStartCamera,
   onStopCamera,
   manualCode,
   isBusy,
   inputContainerRef,
   onManualCodeChange,
   onManualSubmit,
}: QrScannerPanelProps): ReactElement {
   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      onManualSubmit();
   }

   return (
      <div className="space-y-5 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
         <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-900">
               <video ref={videoRef} muted playsInline className="size-full object-cover" />
               {!isCameraActive && (
                  <div className="absolute inset-0 grid place-items-center text-center text-sm text-ink-300">
                     <span className="space-y-2 px-6">
                        <CameraOff className="mx-auto size-10" aria-hidden="true" />
                        <span className="block">Camera đang tắt</span>
                     </span>
                  </div>
               )}
               {isCameraActive && (
                  <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-brand-400/80" />
               )}
            </div>
            {cameraErrorMessage && <p className="text-sm font-semibold text-danger-700">{cameraErrorMessage}</p>}
            {isCameraActive ? (
               <Button
                  variant="secondary"
                  fullWidth
                  onClick={onStopCamera}
                  icon={<CameraOff className="size-4" aria-hidden="true" />}
               >
                  Tắt camera
               </Button>
            ) : (
               <Button fullWidth onClick={onStartCamera} icon={<Camera className="size-4" aria-hidden="true" />}>
                  Bật camera quét QR
               </Button>
            )}
         </div>

         <form onSubmit={handleSubmit} className="space-y-3 border-t border-ink-100 pt-5">
            <div ref={inputContainerRef}>
               <TextField
                  id="check-in-code"
                  label="Nhập mã hoặc dùng máy quét"
                  value={manualCode}
                  onChange={onManualCodeChange}
                  icon={Keyboard}
                  placeholder="Mã QR hoặc mã đơn (BK...)"
                  autoFocus
                  autoComplete="off"
               />
            </div>
            <Button type="submit" fullWidth disabled={isBusy || manualCode.trim() === ''}>
               Kiểm tra vé
            </Button>
         </form>
      </div>
   );
}

export default QrScannerPanel;
