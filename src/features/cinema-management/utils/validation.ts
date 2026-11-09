const HOTLINE_PATTERN: RegExp = /^\+?[0-9]{8,15}$/;
const HTTPS_URL_PATTERN: RegExp = /^https:\/\/\S+$/;
const MIN_LATITUDE: number = -90;
const MAX_LATITUDE: number = 90;
const MIN_LONGITUDE: number = -180;
const MAX_LONGITUDE: number = 180;

export interface CoordinateErrors {
   latitude?: string;
   longitude?: string;
}

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

export function validateHotline(hotline: string): string | undefined {
   const trimmedHotline: string = hotline.trim();
   if (trimmedHotline.length === 0) {
      return undefined;
   }
   return HOTLINE_PATTERN.test(trimmedHotline) ? undefined : 'Số hotline không hợp lệ (8 đến 15 chữ số)';
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

function validateCoordinate(value: string, label: string, minimum: number, maximum: number): string | undefined {
   const parsedValue: number = Number(value.trim().replace(',', '.'));
   if (Number.isNaN(parsedValue)) {
      return `${label} phải là một số`;
   }
   return parsedValue < minimum || parsedValue > maximum
      ? `${label} phải nằm trong khoảng ${minimum} đến ${maximum}`
      : undefined;
}

export function validateCoordinates(latitude: string, longitude: string): CoordinateErrors {
   const hasLatitude: boolean = latitude.trim().length > 0;
   const hasLongitude: boolean = longitude.trim().length > 0;
   if (!hasLatitude && !hasLongitude) {
      return {};
   }
   return {
      latitude: hasLatitude
         ? validateCoordinate(latitude, 'Vĩ độ', MIN_LATITUDE, MAX_LATITUDE)
         : 'Nhập vĩ độ cùng với kinh độ',
      longitude: hasLongitude
         ? validateCoordinate(longitude, 'Kinh độ', MIN_LONGITUDE, MAX_LONGITUDE)
         : 'Nhập kinh độ cùng với vĩ độ',
   };
}

export function parseCoordinate(value: string): number | null {
   const trimmedValue: string = value.trim();
   return trimmedValue.length === 0 ? null : Number(trimmedValue.replace(',', '.'));
}

export function emptyToNull(value: string): string | null {
   const trimmedValue: string = value.trim();
   return trimmedValue.length === 0 ? null : trimmedValue;
}
