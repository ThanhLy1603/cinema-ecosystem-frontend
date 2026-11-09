const COMBINING_MARKS_PATTERN: RegExp = /[̀-ͯ]/g;

export function normalizeSearchText(text: string): string {
   return text
      .normalize('NFD')
      .replace(COMBINING_MARKS_PATTERN, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
}
