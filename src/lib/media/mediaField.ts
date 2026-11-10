import type { MediaFieldState } from '@/types/media/media';

export function createMediaFieldState(url: string | null | undefined): MediaFieldState {
   return { url: url ?? '', file: null };
}

export function getMediaUrlToValidate(mediaFieldState: MediaFieldState): string {
   return mediaFieldState.file === null ? mediaFieldState.url : '';
}
