const EMPLOYEE_CODE_PATTERN: RegExp = /^[A-Za-z0-9_-]+$/;
const MAX_EMPLOYEE_CODE_LENGTH: number = 50;

export function validateEmployeeCode(employeeCode: string): string | undefined {
   const trimmedEmployeeCode: string = employeeCode.trim();
   if (trimmedEmployeeCode.length === 0) {
      return 'Vui lòng nhập mã nhân viên';
   }
   if (trimmedEmployeeCode.length > MAX_EMPLOYEE_CODE_LENGTH) {
      return `Mã nhân viên tối đa ${MAX_EMPLOYEE_CODE_LENGTH} ký tự`;
   }
   return EMPLOYEE_CODE_PATTERN.test(trimmedEmployeeCode)
      ? undefined
      : 'Mã nhân viên chỉ gồm chữ, số, gạch ngang và gạch dưới';
}

export function validateBranchSelection(selectedCinemaIds: number[]): string | undefined {
   return selectedCinemaIds.length === 0 ? 'Phải chọn ít nhất một chi nhánh' : undefined;
}

export function emptyToNull(value: string): string | null {
   const trimmedValue: string = value.trim();
   return trimmedValue.length === 0 ? null : trimmedValue;
}

export function validateRequiredSelection(selectedValue: string, message: string): string | undefined {
   return selectedValue.length === 0 ? message : undefined;
}
