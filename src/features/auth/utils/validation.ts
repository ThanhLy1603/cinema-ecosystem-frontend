const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN: RegExp = /^\+?[0-9]{9,15}$/;
const LETTER_PATTERN: RegExp = /\p{L}/u;
const DIGIT_PATTERN: RegExp = /\d/;
const AVATAR_URL_PATTERN: RegExp = /^https:\/\/\S+$/;
const MAX_AVATAR_URL_LENGTH: number = 500;
const MAX_PASSWORD_BYTES: number = 72;
const MIN_PASSWORD_LENGTH: number = 8;

export function validateEmail(email: string): string | undefined {
   const trimmedEmail: string = email.trim();
   if (trimmedEmail.length === 0) {
      return 'Vui lòng nhập email';
   }
   if (trimmedEmail.length > 150 || !EMAIL_PATTERN.test(trimmedEmail)) {
      return 'Email không hợp lệ';
   }
   return undefined;
}

export function validateLoginPassword(password: string): string | undefined {
   return password.length === 0 ? 'Vui lòng nhập mật khẩu' : undefined;
}

export function validateNewPassword(password: string): string | undefined {
   if (password.length === 0) {
      return 'Vui lòng nhập mật khẩu';
   }
   if (password.length < MIN_PASSWORD_LENGTH) {
      return `Mật khẩu cần tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
   }
   if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
      return 'Mật khẩu quá dài (tối đa 72 byte)';
   }
   if (!LETTER_PATTERN.test(password) || !DIGIT_PATTERN.test(password)) {
      return 'Mật khẩu phải gồm cả chữ và số';
   }
   return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
   if (confirmPassword.length === 0) {
      return 'Vui lòng nhập lại mật khẩu';
   }
   return password === confirmPassword ? undefined : 'Mật khẩu nhập lại không khớp';
}

export function validateFullName(fullName: string): string | undefined {
   const trimmedFullName: string = fullName.trim();
   if (trimmedFullName.length === 0) {
      return 'Vui lòng nhập họ và tên';
   }
   return trimmedFullName.length > 150 ? 'Họ tên tối đa 150 ký tự' : undefined;
}

export function validatePhone(phone: string): string | undefined {
   const trimmedPhone: string = phone.trim();
   if (trimmedPhone.length === 0) {
      return undefined;
   }
   return PHONE_PATTERN.test(trimmedPhone) ? undefined : 'Số điện thoại không hợp lệ (9 đến 15 chữ số)';
}

export function validateDateOfBirth(dateOfBirth: string): string | undefined {
   if (dateOfBirth.length === 0) {
      return undefined;
   }
   const parsedTime: number = Date.parse(dateOfBirth);
   if (Number.isNaN(parsedTime) || parsedTime >= Date.now()) {
      return 'Ngày sinh phải là một ngày trong quá khứ';
   }
   return undefined;
}

export function validateAvatarUrl(avatarUrl: string): string | undefined {
   const trimmedAvatarUrl: string = avatarUrl.trim();
   if (trimmedAvatarUrl.length === 0) {
      return undefined;
   }
   if (trimmedAvatarUrl.length > MAX_AVATAR_URL_LENGTH) {
      return `Đường dẫn ảnh tối đa ${MAX_AVATAR_URL_LENGTH} ký tự`;
   }
   return AVATAR_URL_PATTERN.test(trimmedAvatarUrl)
      ? undefined
      : 'Ảnh đại diện phải là đường dẫn bắt đầu bằng https://';
}

export function getPasswordStrength(password: string): number {
   let score: number = 0;
   if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
   if (LETTER_PATTERN.test(password) && DIGIT_PATTERN.test(password)) score += 1;
   if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
   if (/[^\p{L}\d]/u.test(password) || password.length >= 12) score += 1;
   return score;
}
