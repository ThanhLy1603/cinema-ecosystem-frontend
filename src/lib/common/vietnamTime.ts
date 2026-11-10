const VIETNAM_UTC_OFFSET_HOURS: number = 7;
const MILLISECONDS_PER_MINUTE: number = 60 * 1000;
const MILLISECONDS_PER_HOUR: number = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY: number = 24 * MILLISECONDS_PER_HOUR;
const VIETNAM_UTC_OFFSET_MILLISECONDS: number = VIETNAM_UTC_OFFSET_HOURS * MILLISECONDS_PER_HOUR;
const VIETNAM_UTC_OFFSET_SUFFIX: string = '+07:00';
const WEEKDAY_LABELS: string[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const MINUTES_PER_DAY: number = 24 * 60;

function toVietnamIsoString(instantMilliseconds: number): string {
   return new Date(instantMilliseconds + VIETNAM_UTC_OFFSET_MILLISECONDS).toISOString();
}

export function todayInVietnam(): string {
   return toVietnamIsoString(Date.now()).slice(0, 10);
}

export function toVietnamDate(isoInstant: string): string {
   return toVietnamIsoString(Date.parse(isoInstant)).slice(0, 10);
}

export function toVietnamTimeOfDay(isoInstant: string): string {
   return toVietnamIsoString(Date.parse(isoInstant)).slice(11, 16);
}

export function toVietnamInstant(date: string, timeOfDay: string): string {
   return `${date}T${timeOfDay}:00${VIETNAM_UTC_OFFSET_SUFFIX}`;
}

export function getDayStartMilliseconds(date: string): number {
   return Date.parse(toVietnamInstant(date, '00:00'));
}

export function getMinutesFromDayStart(isoInstant: string, date: string): number {
   return (Date.parse(isoInstant) - getDayStartMilliseconds(date)) / MILLISECONDS_PER_MINUTE;
}

export function addMinutesToInstant(isoInstant: string, minutes: number): string {
   return new Date(Date.parse(isoInstant) + minutes * MILLISECONDS_PER_MINUTE).toISOString();
}

export function addDaysToDate(date: string, days: number): string {
   return new Date(Date.parse(`${date}T00:00:00Z`) + days * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
}

export function isValidDate(date: string): boolean {
   return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`));
}

export function isValidTimeOfDay(timeOfDay: string): boolean {
   return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeOfDay);
}

export function formatDisplayDate(date: string): string {
   const [year, month, day]: string[] = date.split('-');
   return `${day}/${month}/${year}`;
}

export function formatDayMonth(date: string): string {
   const [, month, day]: string[] = date.split('-');
   return `${day}/${month}`;
}

export function getWeekdayIndex(date: string): number {
   return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function getWeekdayLabel(date: string): string {
   return WEEKDAY_LABELS[getWeekdayIndex(date)];
}

export function formatClockRange(startIsoInstant: string, endIsoInstant: string): string {
   return `${toVietnamTimeOfDay(startIsoInstant)} – ${toVietnamTimeOfDay(endIsoInstant)}`;
}
