const HTTPS_URL_PATTERN: RegExp = /^https:\/\/\S+$/;

export function validateRequiredText(value: string, requiredMessage: string, maxLength: number): string | undefined {
   const trimmedValue: string = value.trim();
   if (trimmedValue.length === 0) {
      return requiredMessage;
   }
   return trimmedValue.length > maxLength ? `Tối đa ${maxLength} ký tự` : undefined;
}

export function validateRequiredSelection(selectedValue: string, message: string): string | undefined {
   return selectedValue.length === 0 ? message : undefined;
}

export function validateOptionalText(value: string, maxLength: number): string | undefined {
   return value.trim().length > maxLength ? `Tối đa ${maxLength} ký tự` : undefined;
}

export function validateOptionalHttpsUrl(value: string, maxLength: number): string | undefined {
   const trimmedValue: string = value.trim();
   if (trimmedValue.length === 0) {
      return undefined;
   }
   if (trimmedValue.length > maxLength) {
      return `Đường dẫn tối đa ${maxLength} ký tự`;
   }
   return HTTPS_URL_PATTERN.test(trimmedValue) ? undefined : 'Đường dẫn phải bắt đầu bằng https://';
}

export function emptyToNull(value: string): string | null {
   const trimmedValue: string = value.trim();
   return trimmedValue.length === 0 ? null : trimmedValue;
}
