export function getSeatSelectionPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/seats`;
}

export function getFnbSelectionPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/fnb`;
}

export function getPaymentPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/payment`;
}
