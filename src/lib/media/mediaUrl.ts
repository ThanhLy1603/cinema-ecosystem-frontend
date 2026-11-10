const DIRECT_VIDEO_PATTERN: RegExp = /^https:\/\/\S+\.(mp4|webm|mov)(\?\S*)?$/i;

export function isDirectVideoUrl(mediaUrl: string): boolean {
   return DIRECT_VIDEO_PATTERN.test(mediaUrl.trim());
}
