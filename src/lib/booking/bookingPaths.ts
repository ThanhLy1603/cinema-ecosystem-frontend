export function getSeatSelectionPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/seats`;
}

export function getFnbSelectionPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/fnb`;
}

export function getPaymentPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/payment`;
}

export function getShowtimeSelectionPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking?showtime=${showtimeId}`;
}

export const PAYMENT_RESULT_PATH: string = '/payment/result';

export const PAYMENT_SIMULATOR_PATH: string = '/payment/simulator';

export const MY_TICKETS_PATH: string = '/tickets';
