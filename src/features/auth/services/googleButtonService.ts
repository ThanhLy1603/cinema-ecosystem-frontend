import type { RefObject } from 'react';
import type { GoogleAccountsId } from '@/types/auth/google';

const GOOGLE_SCRIPT_URL: string = 'https://accounts.google.com/gsi/client';
const MAX_BUTTON_WIDTH: number = 400;

let googleAccountsIdPromise: Promise<GoogleAccountsId> | null = null;

function loadGoogleAccountsId(): Promise<GoogleAccountsId> {
   if (googleAccountsIdPromise !== null) {
      return googleAccountsIdPromise;
   }

   googleAccountsIdPromise = new Promise<GoogleAccountsId>((resolve, reject): void => {
      const scriptElement: HTMLScriptElement = document.createElement('script');
      scriptElement.src = GOOGLE_SCRIPT_URL;
      scriptElement.async = true;

      function handleLoad(): void {
         const googleAccountsId: GoogleAccountsId | undefined = window.google?.accounts.id;
         if (googleAccountsId) {
            resolve(googleAccountsId);
            return;
         }
         handleError();
      }

      function handleError(): void {
         googleAccountsIdPromise = null;
         scriptElement.remove();
         reject(new Error('Không tải được Google Identity Services'));
      }

      scriptElement.addEventListener('load', handleLoad);
      scriptElement.addEventListener('error', handleError);
      document.head.appendChild(scriptElement);
   });

   return googleAccountsIdPromise;
}

export function mountGoogleButton(
   containerRef: RefObject<HTMLDivElement | null>,
   googleClientId: string,
   onCredential: (idToken: string) => void,
   onLoadError: () => void,
): () => void {
   let isCancelled: boolean = false;

   function renderButton(googleAccountsId: GoogleAccountsId): void {
      const containerElement: HTMLDivElement | null = containerRef.current;
      if (isCancelled || containerElement === null) {
         return;
      }
      googleAccountsId.initialize({
         client_id: googleClientId,
         callback: (googleCredentialResponse) => onCredential(googleCredentialResponse.credential),
      });
      googleAccountsId.renderButton(containerElement, {
         type: 'standard',
         theme: 'outline',
         size: 'large',
         text: 'continue_with',
         shape: 'pill',
         locale: 'vi',
         width: Math.min(containerElement.offsetWidth, MAX_BUTTON_WIDTH),
      });
   }

   function handleLoadError(): void {
      if (!isCancelled) {
         onLoadError();
      }
   }

   loadGoogleAccountsId().then(renderButton, handleLoadError);

   return (): void => {
      isCancelled = true;
      containerRef.current?.replaceChildren();
   };
}
