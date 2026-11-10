import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';
export type ButtonSize = 'md' | 'lg';

const BASE_CLASSES: string =
   'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
   primary:
      'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow hover:from-brand-500 hover:to-brand-700 focus-visible:ring-brand-200',
   secondary:
      'border border-ink-200 bg-white text-ink-800 shadow-sm hover:border-brand-300 hover:text-brand-700 focus-visible:ring-brand-100',
   ghost: 'text-ink-700 hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-brand-100',
   light: 'bg-white text-brand-700 shadow-sm hover:bg-brand-50 focus-visible:ring-white/50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
   md: 'h-11 px-5 text-sm',
   lg: 'h-13 px-7 text-base',
};

export function buttonClasses(
   variant: ButtonVariant,
   size: ButtonSize,
   fullWidth: boolean,
   className: string | undefined,
): string {
   return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && 'w-full', className);
}
