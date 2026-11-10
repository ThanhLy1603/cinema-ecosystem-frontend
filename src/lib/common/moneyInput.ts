const MAX_MONEY_AMOUNT: number = 10_000_000;
const MONEY_SEPARATOR_PATTERN: RegExp = /[.,\s]/g;
const DIGITS_PATTERN: RegExp = /^\d+$/;

export function parseMoneyInput(rawAmount: string): number | null {
   const digits: string = rawAmount.replace(MONEY_SEPARATOR_PATTERN, '');
   return DIGITS_PATTERN.test(digits) ? Number(digits) : null;
}

export function validateMoneyInput(rawAmount: string, requiredMessage: string, label: string): string | undefined {
   if (rawAmount.trim().length === 0) {
      return requiredMessage;
   }
   const amount: number | null = parseMoneyInput(rawAmount);
   if (amount === null) {
      return `${label} chỉ gồm chữ số`;
   }
   return amount > MAX_MONEY_AMOUNT ? `${label} tối đa 10.000.000đ` : undefined;
}

export function parseValidMoneyInput(rawAmount: string): number | null {
   const amount: number | null = parseMoneyInput(rawAmount);
   return amount !== null && amount <= MAX_MONEY_AMOUNT ? amount : null;
}
