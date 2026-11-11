export function getSeatSelectionPath(movieSlug: string, showtimeId: number): string {
   return `/movies/${movieSlug}/booking/${showtimeId}/seats`;
}
