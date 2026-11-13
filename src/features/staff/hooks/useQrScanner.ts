import jsQR, { type QRCode } from 'jsqr';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const SCAN_INTERVAL_MILLISECONDS: number = 200;
const SAME_CODE_COOLDOWN_MILLISECONDS: number = 3000;
const MAX_FRAME_WIDTH: number = 640;

export interface QrScanner {
   videoRef: RefObject<HTMLVideoElement | null>;
   isActive: boolean;
   errorMessage: string | null;
   start: () => Promise<void>;
   stop: () => void;
}

export function useQrScanner(onDetect: (code: string) => void): QrScanner {
   const videoRef = useRef<HTMLVideoElement>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const intervalIdRef = useRef<number | null>(null);
   const lastCodeRef = useRef<{ code: string; detectedAt: number } | null>(null);
   const onDetectRef = useRef<(code: string) => void>(onDetect);
   const [isActive, setIsActive] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   useEffect((): void => {
      onDetectRef.current = onDetect;
   }, [onDetect]);

   const stop: () => void = useCallback((): void => {
      if (intervalIdRef.current !== null) {
         window.clearInterval(intervalIdRef.current);
         intervalIdRef.current = null;
      }
      streamRef.current?.getTracks().forEach((mediaStreamTrack) => mediaStreamTrack.stop());
      streamRef.current = null;
      if (videoRef.current) {
         videoRef.current.srcObject = null;
      }
      setIsActive(false);
   }, []);

   const scanFrame: (canvas: HTMLCanvasElement) => void = useCallback((canvas: HTMLCanvasElement): void => {
      const videoElement: HTMLVideoElement | null = videoRef.current;
      if (!videoElement || videoElement.videoWidth === 0) {
         return;
      }
      const scale: number = Math.min(1, MAX_FRAME_WIDTH / videoElement.videoWidth);
      const frameWidth: number = Math.round(videoElement.videoWidth * scale);
      const frameHeight: number = Math.round(videoElement.videoHeight * scale);
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      const canvasContext: CanvasRenderingContext2D | null = canvas.getContext('2d', { willReadFrequently: true });
      if (!canvasContext) {
         return;
      }
      canvasContext.drawImage(videoElement, 0, 0, frameWidth, frameHeight);
      const imageData: ImageData = canvasContext.getImageData(0, 0, frameWidth, frameHeight);
      const qrCode: QRCode | null = jsQR(imageData.data, frameWidth, frameHeight, { inversionAttempts: 'dontInvert' });
      if (!qrCode || qrCode.data === '') {
         return;
      }
      const now: number = Date.now();
      const lastCode: { code: string; detectedAt: number } | null = lastCodeRef.current;
      if (lastCode && lastCode.code === qrCode.data && now - lastCode.detectedAt < SAME_CODE_COOLDOWN_MILLISECONDS) {
         return;
      }
      lastCodeRef.current = { code: qrCode.data, detectedAt: now };
      onDetectRef.current(qrCode.data);
   }, []);

   const start: () => Promise<void> = useCallback(async (): Promise<void> => {
      setErrorMessage(null);
      if (!navigator.mediaDevices?.getUserMedia) {
         setErrorMessage('Trình duyệt không hỗ trợ camera hoặc trang chưa chạy trên HTTPS.');
         return;
      }
      try {
         const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
         });
         streamRef.current = mediaStream;
         const videoElement: HTMLVideoElement | null = videoRef.current;
         if (!videoElement) {
            mediaStream.getTracks().forEach((mediaStreamTrack) => mediaStreamTrack.stop());
            return;
         }
         videoElement.srcObject = mediaStream;
         await videoElement.play();
         const canvas: HTMLCanvasElement = document.createElement('canvas');
         intervalIdRef.current = window.setInterval((): void => scanFrame(canvas), SCAN_INTERVAL_MILLISECONDS);
         setIsActive(true);
      } catch {
         setErrorMessage('Không mở được camera. Hãy cấp quyền camera cho trang này hoặc nhập mã thủ công.');
         stop();
      }
   }, [scanFrame, stop]);

   useEffect((): (() => void) => stop, [stop]);

   return { videoRef, isActive, errorMessage, start, stop };
}
