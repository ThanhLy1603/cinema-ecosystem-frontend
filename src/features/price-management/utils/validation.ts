import { validateRequiredSelection, validateRequiredText } from '@/lib/common/formValidation';
import { parseMoneyInput, validateMoneyInput } from '@/lib/common/moneyInput';
import { isValidDate, isValidTimeOfDay } from '@/lib/common/vietnamTime';
import type { ScreenType } from '@/types/cinema/cinema';
import type { PriceDayType, PriceRule, PriceRuleRequest, PriceRuleType } from '@/types/showtime/pricing';

export interface PriceRuleFormValues {
   ruleName: string;
   ruleType: string;
   surchargeAmount: string;
   dayType: string;
   timeFrom: string;
   timeTo: string;
   screenType: string;
   validFrom: string;
   validTo: string;
}

export type PriceRuleFormErrors = Partial<Record<keyof PriceRuleFormValues, string>>;

const RULE_NAME_MAX_LENGTH: number = 150;
const TIME_PREFIX_LENGTH: number = 5;

export function buildEmptyFormValues(ruleType: PriceRuleType): PriceRuleFormValues {
   return {
      ruleName: '',
      ruleType,
      surchargeAmount: '',
      dayType: 'WEEKEND',
      timeFrom: '22:00',
      timeTo: '04:00',
      screenType: 'IMAX',
      validFrom: '',
      validTo: '',
   };
}

export function buildFormValuesFromRule(priceRule: PriceRule): PriceRuleFormValues {
   return {
      ruleName: priceRule.ruleName,
      ruleType: priceRule.ruleType,
      surchargeAmount: String(priceRule.surchargeAmount),
      dayType: priceRule.ruleType === 'DAY_TYPE' ? priceRule.dayType : 'WEEKEND',
      timeFrom: priceRule.timeFrom ? priceRule.timeFrom.slice(0, TIME_PREFIX_LENGTH) : '22:00',
      timeTo: priceRule.timeTo ? priceRule.timeTo.slice(0, TIME_PREFIX_LENGTH) : '04:00',
      screenType: priceRule.screenType ?? 'IMAX',
      validFrom: priceRule.validFrom ?? '',
      validTo: priceRule.validTo ?? '',
   };
}

function validateTimeSlot(priceRuleFormValues: PriceRuleFormValues): PriceRuleFormErrors {
   const timeFromError: string | undefined = isValidTimeOfDay(priceRuleFormValues.timeFrom)
      ? undefined
      : 'Vui lòng nhập giờ bắt đầu (HH:mm)';
   const timeToError: string | undefined = isValidTimeOfDay(priceRuleFormValues.timeTo)
      ? undefined
      : 'Vui lòng nhập giờ kết thúc (HH:mm)';
   if (timeFromError || timeToError) {
      return { timeFrom: timeFromError, timeTo: timeToError };
   }
   return {
      timeTo:
         priceRuleFormValues.timeFrom === priceRuleFormValues.timeTo
            ? 'Giờ kết thúc không được trùng giờ bắt đầu'
            : undefined,
   };
}

function validateValidity(priceRuleFormValues: PriceRuleFormValues): PriceRuleFormErrors {
   const isHoliday: boolean = priceRuleFormValues.ruleType === 'DAY_TYPE' && priceRuleFormValues.dayType === 'HOLIDAY';
   const validFromError: string | undefined = validateOptionalDate(
      priceRuleFormValues.validFrom,
      isHoliday,
      'Ngày lễ cần ngày bắt đầu áp dụng',
   );
   const validToError: string | undefined = validateOptionalDate(
      priceRuleFormValues.validTo,
      isHoliday,
      'Ngày lễ cần ngày kết thúc áp dụng',
   );
   if (validFromError || validToError) {
      return { validFrom: validFromError, validTo: validToError };
   }
   const isReversed: boolean =
      priceRuleFormValues.validFrom !== '' &&
      priceRuleFormValues.validTo !== '' &&
      priceRuleFormValues.validTo < priceRuleFormValues.validFrom;
   return { validTo: isReversed ? 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu' : undefined };
}

function validateOptionalDate(date: string, isRequired: boolean, requiredMessage: string): string | undefined {
   if (date === '') {
      return isRequired ? requiredMessage : undefined;
   }
   return isValidDate(date) ? undefined : 'Ngày không hợp lệ';
}

export function validatePriceRuleForm(priceRuleFormValues: PriceRuleFormValues): PriceRuleFormErrors {
   const typeSpecificErrors: PriceRuleFormErrors =
      priceRuleFormValues.ruleType === 'TIME_SLOT' ? validateTimeSlot(priceRuleFormValues) : {};
   return {
      ruleName: validateRequiredText(priceRuleFormValues.ruleName, 'Vui lòng nhập tên quy tắc', RULE_NAME_MAX_LENGTH),
      ruleType: validateRequiredSelection(priceRuleFormValues.ruleType, 'Vui lòng chọn loại phụ thu'),
      surchargeAmount: validateMoneyInput(
         priceRuleFormValues.surchargeAmount,
         'Vui lòng nhập mức phụ thu',
         'Mức phụ thu',
      ),
      dayType:
         priceRuleFormValues.ruleType === 'DAY_TYPE'
            ? validateRequiredSelection(priceRuleFormValues.dayType, 'Vui lòng chọn loại ngày')
            : undefined,
      screenType:
         priceRuleFormValues.ruleType === 'SCREEN_TYPE'
            ? validateRequiredSelection(priceRuleFormValues.screenType, 'Vui lòng chọn loại phòng')
            : undefined,
      ...typeSpecificErrors,
      ...validateValidity(priceRuleFormValues),
   };
}

export function hasFormErrors(priceRuleFormErrors: PriceRuleFormErrors): boolean {
   return Object.values(priceRuleFormErrors).some((errorMessage) => errorMessage !== undefined);
}

export function buildPriceRuleRequest(priceRuleFormValues: PriceRuleFormValues): PriceRuleRequest | null {
   const surchargeAmount: number | null = parseMoneyInput(priceRuleFormValues.surchargeAmount);
   if (surchargeAmount === null) {
      return null;
   }
   const ruleType: PriceRuleType = priceRuleFormValues.ruleType as PriceRuleType;
   return {
      ruleName: priceRuleFormValues.ruleName.trim(),
      ruleType,
      surchargeAmount,
      dayType: ruleType === 'DAY_TYPE' ? (priceRuleFormValues.dayType as PriceDayType) : null,
      timeFrom: ruleType === 'TIME_SLOT' ? priceRuleFormValues.timeFrom : null,
      timeTo: ruleType === 'TIME_SLOT' ? priceRuleFormValues.timeTo : null,
      screenType: ruleType === 'SCREEN_TYPE' ? (priceRuleFormValues.screenType as ScreenType) : null,
      validFrom: priceRuleFormValues.validFrom === '' ? null : priceRuleFormValues.validFrom,
      validTo: priceRuleFormValues.validTo === '' ? null : priceRuleFormValues.validTo,
   };
}
