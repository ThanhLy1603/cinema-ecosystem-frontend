export type MediaPurpose =
  'MOVIE_POSTER' | 'MOVIE_BANNER' | 'MOVIE_TRAILER' | 'PERSON_AVATAR' | 'FACILITY_ICON' | 'USER_AVATAR';

export type MediaResourceType = 'image' | 'video';

export interface UploadSignature {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: MediaResourceType;
  allowedFormats: string[];
  maxFileSizeBytes: number;
}

export interface MediaFieldState {
  url: string;
  file: File | null;
}
