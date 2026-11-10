import type { FnbComboSearchParams, FnbItemSearchParams } from '@/types/fnb/fnb';

export const ADMIN_FNB_KEY: readonly string[] = ['admin-fnb'];
export const ADMIN_FNB_ITEM_OPTIONS_KEY: readonly string[] = ['admin-fnb', 'item-options'];

export function adminFnbItemListKey(fnbItemSearchParams: FnbItemSearchParams): readonly (string | object)[] {
   return ['admin-fnb', 'items', fnbItemSearchParams];
}

export function adminFnbComboListKey(fnbComboSearchParams: FnbComboSearchParams): readonly (string | object)[] {
   return ['admin-fnb', 'combos', fnbComboSearchParams];
}
