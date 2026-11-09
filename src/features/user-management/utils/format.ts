import type { AuditLog } from '@/types/admin';

export function formatDateTime(isoDateTime: string | undefined): string {
   if (!isoDateTime) {
      return 'Chưa có';
   }
   return new Date(isoDateTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

function formatDetailValue(detailValue: unknown): string {
   if (Array.isArray(detailValue)) {
      return detailValue.length === 0 ? '(trống)' : detailValue.map((item) => String(item)).join(', ');
   }
   if (detailValue === null || detailValue === undefined || detailValue === '') {
      return '(trống)';
   }
   return typeof detailValue === 'object' ? JSON.stringify(detailValue) : String(detailValue);
}

function describeChanges(before: Record<string, unknown>, after: Record<string, unknown>): string {
   return Object.keys(after)
      .map(
         (fieldName) =>
            `${fieldName}: ${formatDetailValue(before[fieldName])} → ${formatDetailValue(after[fieldName])}`,
      )
      .join('; ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function describeAuditDetails(auditLog: AuditLog): string {
   const details: Record<string, unknown> | undefined = auditLog.details;
   if (!details) {
      return '';
   }
   const before: unknown = details.before;
   const after: unknown = details.after;
   if (isRecord(before) && isRecord(after)) {
      return describeChanges(before, after);
   }
   if (before !== undefined && after !== undefined) {
      return `${formatDetailValue(before)} → ${formatDetailValue(after)}`;
   }
   return Object.keys(details)
      .map((fieldName) => `${fieldName}: ${formatDetailValue(details[fieldName])}`)
      .join('; ');
}
