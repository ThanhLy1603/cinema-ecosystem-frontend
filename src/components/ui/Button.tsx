import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/lib/common/buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: ButtonVariant;
   size?: ButtonSize;
   isLoading?: boolean;
   fullWidth?: boolean;
   icon?: ReactNode;
}

export function Button({
   variant = 'primary',
   size = 'md',
   isLoading = false,
   fullWidth = false,
   icon,
   className,
   disabled,
   children,
   type = 'button',
   ...buttonProps
}: ButtonProps): ReactElement {
   return (
      <button
         type={type}
         disabled={disabled || isLoading}
         className={buttonClasses(variant, size, fullWidth, className)}
         {...buttonProps}
      >
         {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : icon}
         {children}
      </button>
   );
}

export default Button;
