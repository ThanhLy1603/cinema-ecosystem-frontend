export function buildMapUrl(latitude: number, longitude: number): string {
   return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function formatCoordinates(latitude: number, longitude: number): string {
   return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
