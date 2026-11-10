import axios, { type AxiosProgressEvent, type AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/api';
import { getErrorMessage } from '@/lib/apiError';
import type { MediaFieldState, MediaPurpose, UploadSignature } from '@/types/media';

interface CloudinaryUploadResult {
   secure_url: string;
}

interface CloudinaryErrorBody {
   error?: { message?: string };
}

const BYTES_PER_MEGABYTE: number = 1024 * 1024;
const GENERIC_UPLOAD_ERROR: string = 'Không tải được tệp lên. Vui lòng thử lại.';

export class MediaUploadError extends Error {}

export async function getUploadSignature(mediaPurpose: MediaPurpose): Promise<UploadSignature> {
   const axiosResponse: AxiosResponse<ApiResponse<UploadSignature>> = await axiosInstance.post<
      ApiResponse<UploadSignature>
   >('/media/upload-signature', { purpose: mediaPurpose });
   return axiosResponse.data.data;
}

export function validateMediaFile(file: File, uploadSignature: UploadSignature): void {
   const extension: string = (file.name.split('.').pop() ?? '').toLowerCase();
   if (!uploadSignature.allowedFormats.includes(extension)) {
      throw new MediaUploadError(`Chỉ chấp nhận tệp ${uploadSignature.allowedFormats.join(', ')}`);
   }
   if (file.size > uploadSignature.maxFileSizeBytes) {
      throw new MediaUploadError(`Tệp tối đa ${Math.floor(uploadSignature.maxFileSizeBytes / BYTES_PER_MEGABYTE)} MB`);
   }
}

export async function uploadMediaFile(
   file: File,
   uploadSignature: UploadSignature,
   onProgress: (percent: number) => void,
): Promise<string> {
   const formData: FormData = new FormData();
   formData.append('file', file);
   formData.append('api_key', uploadSignature.apiKey);
   formData.append('timestamp', String(uploadSignature.timestamp));
   formData.append('signature', uploadSignature.signature);
   formData.append('folder', uploadSignature.folder);
   formData.append('allowed_formats', uploadSignature.allowedFormats.join(','));
   function reportProgress(axiosProgressEvent: AxiosProgressEvent): void {
      if (axiosProgressEvent.total) {
         onProgress(Math.round((axiosProgressEvent.loaded / axiosProgressEvent.total) * 100));
      }
   }
   try {
      const axiosResponse: AxiosResponse<CloudinaryUploadResult> = await axios.post<CloudinaryUploadResult>(
         uploadSignature.uploadUrl,
         formData,
         { onUploadProgress: reportProgress },
      );
      return axiosResponse.data.secure_url;
   } catch (error: unknown) {
      if (axios.isAxiosError<CloudinaryErrorBody>(error)) {
         throw new MediaUploadError(error.response?.data?.error?.message ?? GENERIC_UPLOAD_ERROR);
      }
      throw new MediaUploadError(GENERIC_UPLOAD_ERROR);
   }
}

export function getUploadErrorMessage(error: unknown): string {
   return error instanceof MediaUploadError ? error.message : getErrorMessage(error);
}

export async function uploadPendingMedia(
   mediaFieldState: MediaFieldState,
   mediaPurpose: MediaPurpose,
   onProgress: (percent: number) => void,
): Promise<string> {
   if (mediaFieldState.file === null) {
      return mediaFieldState.url;
   }
   const uploadSignature: UploadSignature = await getUploadSignature(mediaPurpose);
   validateMediaFile(mediaFieldState.file, uploadSignature);
   return uploadMediaFile(mediaFieldState.file, uploadSignature, onProgress);
}
