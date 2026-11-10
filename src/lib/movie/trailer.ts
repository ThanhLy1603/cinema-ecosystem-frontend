import { isDirectVideoUrl } from '@/lib/media/mediaUrl';

const YOUTUBE_ID_PATTERN: RegExp = /^[\w-]{11}$/;
const YOUTUBE_HOSTS: string[] = ['youtube.com', 'www.youtube.com', 'm.youtube.com'];
const YOUTUBE_SHORT_HOST: string = 'youtu.be';
const YOUTUBE_EMBED_BASE_URL: string = 'https://www.youtube-nocookie.com/embed/';

export type TrailerKind = 'youtube' | 'video';

export interface TrailerSource {
   kind: TrailerKind;
   url: string;
}

function extractYoutubeId(parsedUrl: URL): string | null {
   if (parsedUrl.hostname === YOUTUBE_SHORT_HOST) {
      return parsedUrl.pathname.slice(1);
   }
   if (!YOUTUBE_HOSTS.includes(parsedUrl.hostname)) {
      return null;
   }
   if (parsedUrl.pathname === '/watch') {
      return parsedUrl.searchParams.get('v');
   }
   if (parsedUrl.pathname.startsWith('/embed/')) {
      return parsedUrl.pathname.slice('/embed/'.length);
   }
   return null;
}

export function toTrailerSource(trailerUrl: string, shouldAutoplay: boolean): TrailerSource | null {
   if (isDirectVideoUrl(trailerUrl)) {
      return { kind: 'video', url: trailerUrl.trim() };
   }
   try {
      const youtubeId: string | null = extractYoutubeId(new URL(trailerUrl));
      return youtubeId !== null && YOUTUBE_ID_PATTERN.test(youtubeId)
         ? { kind: 'youtube', url: `${YOUTUBE_EMBED_BASE_URL}${youtubeId}?rel=0${shouldAutoplay ? '&autoplay=1' : ''}` }
         : null;
   } catch {
      return null;
   }
}
