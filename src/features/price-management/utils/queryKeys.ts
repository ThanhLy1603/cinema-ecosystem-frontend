export const ADMIN_PRICE_RULES_KEY: readonly string[] = ['admin-price-rules'];

export function adminPriceRuleListKey(deleted: boolean): readonly (string | boolean)[] {
   return ['admin-price-rules', 'list', deleted];
}
