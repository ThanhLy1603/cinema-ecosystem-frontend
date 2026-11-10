import { useState } from 'react';
import { getUploadErrorMessage, uploadPendingMedia } from '@/api/mediaApi';
import type { MediaFieldState, MediaPurpose } from '@/types/media';

export interface PendingUploadRequest {
   label: string;
   mediaFieldState: MediaFieldState;
   mediaPurpose: MediaPurpose;
   onUploaded: (uploadedUrl: string) => void;
}

export interface DeferredUpload {
   isUploading: boolean;
   uploadMessage: string | null;
   uploadError: string | null;
   uploadPendingFiles: (pendingUploadRequests: PendingUploadRequest[]) => Promise<string[] | null>;
}

export function useDeferredUpload(): DeferredUpload {
   const [uploadMessage, setUploadMessage] = useState<string | null>(null);
   const [uploadError, setUploadError] = useState<string | null>(null);

   async function uploadPendingFiles(pendingUploadRequests: PendingUploadRequest[]): Promise<string[] | null> {
      setUploadError(null);
      const resolvedUrls: string[] = [];
      try {
         for (const pendingUploadRequest of pendingUploadRequests) {
            const label: string = pendingUploadRequest.label;
            setUploadMessage(`Đang tải lên ${label}...`);
            const resolvedUrl: string = await uploadPendingMedia(
               pendingUploadRequest.mediaFieldState,
               pendingUploadRequest.mediaPurpose,
               (percent) => setUploadMessage(`Đang tải lên ${label}... ${percent}%`),
            );
            if (pendingUploadRequest.mediaFieldState.file !== null) {
               pendingUploadRequest.onUploaded(resolvedUrl);
            }
            resolvedUrls.push(resolvedUrl);
         }
         return resolvedUrls;
      } catch (error: unknown) {
         setUploadError(getUploadErrorMessage(error));
         return null;
      } finally {
         setUploadMessage(null);
      }
   }

   return { isUploading: uploadMessage !== null, uploadMessage, uploadError, uploadPendingFiles };
}
