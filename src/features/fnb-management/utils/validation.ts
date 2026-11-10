import {
   emptyToNull,
   validateOptionalHttpsUrl,
   validateOptionalText,
   validateRequiredSelection,
   validateRequiredText,
} from '@/lib/common/formValidation';
import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/common/apiError';
import { parseValidMoneyInput, validateMoneyInput } from '@/lib/common/moneyInput';
import type { FnbCategory, FnbComboItemRequest, FnbComboRequest, FnbItemRequest, FnbStatus } from '@/types/fnb/fnb';

const URL_MAX_LENGTH: number = 500;
const MAX_COMBO_LINES: number = 20;
const MIN_LINE_QUANTITY: number = 1;
const MAX_LINE_QUANTITY: number = 20;
const NAME_CONFLICT_ERROR_CODE: string = 'FNB_NAME_EXISTS';

export interface FnbItemFormValues {
   name: string;
   category: string;
   price: string;
   status: string;
   imageUrl: string;
}

export interface FnbItemFormErrors {
   name?: string;
   category?: string;
   price?: string;
   status?: string;
   imageUrl?: string;
}

let comboLineKeyCounter: number = 0;

export function createComboLineKey(): number {
   comboLineKeyCounter += 1;
   return comboLineKeyCounter;
}

export interface ComboLineDraft {
   key: number;
   itemId: string;
   quantity: string;
}

export interface FnbComboFormValues {
   name: string;
   description: string;
   price: string;
   status: string;
   imageUrl: string;
   lines: ComboLineDraft[];
}

export interface FnbComboFormErrors {
   name?: string;
   description?: string;
   price?: string;
   status?: string;
   imageUrl?: string;
   items?: string;
}

export function hasFnbFormErrors(fnbFormErrors: object): boolean {
   return Object.values(fnbFormErrors).some((message) => message !== undefined);
}

export function getFnbServerFieldErrors(error: unknown): Record<string, string> {
   if (getErrorCode(error) === NAME_CONFLICT_ERROR_CODE) {
      return { name: getErrorMessage(error) };
   }
   return getFieldErrors(error);
}

export function validateFnbItemForm(fnbItemFormValues: FnbItemFormValues): FnbItemFormErrors {
   return {
      name: validateRequiredText(fnbItemFormValues.name, 'Vui lòng nhập tên món', 150),
      category: validateRequiredSelection(fnbItemFormValues.category, 'Vui lòng chọn nhóm món'),
      price: validateMoneyInput(fnbItemFormValues.price, 'Vui lòng nhập giá', 'Giá'),
      status: validateRequiredSelection(fnbItemFormValues.status, 'Vui lòng chọn trạng thái'),
      imageUrl: validateOptionalHttpsUrl(fnbItemFormValues.imageUrl, URL_MAX_LENGTH),
   };
}

export function buildFnbItemRequest(
   fnbItemFormValues: FnbItemFormValues,
   resolvedImageUrl: string,
): FnbItemRequest | null {
   const price: number | null = parseValidMoneyInput(fnbItemFormValues.price);
   if (price === null) {
      return null;
   }
   return {
      name: fnbItemFormValues.name.trim(),
      category: fnbItemFormValues.category as FnbCategory,
      price,
      imageUrl: emptyToNull(resolvedImageUrl),
      status: fnbItemFormValues.status as FnbStatus,
   };
}

export function validateComboLines(comboLineDrafts: ComboLineDraft[]): string | undefined {
   if (comboLineDrafts.length === 0) {
      return 'Combo cần ít nhất một món';
   }
   if (comboLineDrafts.length > MAX_COMBO_LINES) {
      return `Mỗi combo tối đa ${MAX_COMBO_LINES} món`;
   }
   if (comboLineDrafts.some((comboLineDraft) => comboLineDraft.itemId === '')) {
      return 'Mỗi dòng cần chọn một món';
   }
   const hasInvalidQuantity: boolean = comboLineDrafts.some((comboLineDraft) => {
      const quantity: number = Number(comboLineDraft.quantity);
      return !Number.isInteger(quantity) || quantity < MIN_LINE_QUANTITY || quantity > MAX_LINE_QUANTITY;
   });
   if (hasInvalidQuantity) {
      return `Số lượng mỗi món phải từ ${MIN_LINE_QUANTITY} đến ${MAX_LINE_QUANTITY}`;
   }
   const itemIds: Set<string> = new Set<string>(comboLineDrafts.map((comboLineDraft) => comboLineDraft.itemId));
   return itemIds.size === comboLineDrafts.length
      ? undefined
      : 'Một món chỉ xuất hiện một lần trong combo, hãy tăng số lượng thay vì thêm dòng';
}

export function validateFnbComboForm(fnbComboFormValues: FnbComboFormValues): FnbComboFormErrors {
   return {
      name: validateRequiredText(fnbComboFormValues.name, 'Vui lòng nhập tên combo', 150),
      description: validateOptionalText(fnbComboFormValues.description, 2000),
      price: validateMoneyInput(fnbComboFormValues.price, 'Vui lòng nhập giá', 'Giá'),
      status: validateRequiredSelection(fnbComboFormValues.status, 'Vui lòng chọn trạng thái'),
      imageUrl: validateOptionalHttpsUrl(fnbComboFormValues.imageUrl, URL_MAX_LENGTH),
      items: validateComboLines(fnbComboFormValues.lines),
   };
}

export function buildFnbComboRequest(
   fnbComboFormValues: FnbComboFormValues,
   resolvedImageUrl: string,
): FnbComboRequest | null {
   const price: number | null = parseValidMoneyInput(fnbComboFormValues.price);
   if (price === null) {
      return null;
   }
   const items: FnbComboItemRequest[] = fnbComboFormValues.lines.map((comboLineDraft) => ({
      itemId: Number(comboLineDraft.itemId),
      quantity: Number(comboLineDraft.quantity),
   }));
   return {
      name: fnbComboFormValues.name.trim(),
      description: emptyToNull(fnbComboFormValues.description),
      price,
      imageUrl: emptyToNull(resolvedImageUrl),
      status: fnbComboFormValues.status as FnbStatus,
      items,
   };
}
