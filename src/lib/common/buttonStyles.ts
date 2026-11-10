import { cn } from '@/lib/common/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE_CLASSES: string =
   'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
   primary: 'bg-brand-600 text-white shadow-glow hover:bg-brand-700 focus-visible:ring-brand-200',
   secondary:
      'border border-ink-200 bg-white text-ink-800 shadow-sm hover:border-ink-300 hover:bg-ink-50 focus-visible:ring-brand-100',
   ghost: 'text-ink-700 hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-brand-100',
   light: 'bg-white text-brand-700 shadow-sm hover:bg-brand-50 focus-visible:ring-white/50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
   sm: 'h-8 px-3 text-[13px]',
   md: 'h-10 px-4 text-sm',
   lg: 'h-12 px-6 text-base',
};

export function buttonClasses(
   variant: ButtonVariant,
   size: ButtonSize,
   fullWidth: boolean,
   className: string | undefined,
): string {
   return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && 'w-full', className);
}
