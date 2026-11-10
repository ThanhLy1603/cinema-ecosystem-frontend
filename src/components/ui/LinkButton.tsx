import type { ReactElement, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/lib/common/buttonStyles';

interface LinkButtonProps extends LinkProps {
   variant?: ButtonVariant;
   size?: ButtonSize;
   fullWidth?: boolean;
   icon?: ReactNode;
}

export function LinkButton({
   variant = 'primary',
   size = 'md',
   fullWidth = false,
   icon,
   className,
   children,
   ...linkProps
}: LinkButtonProps): ReactElement {
   return (
      <Link className={buttonClasses(variant, size, fullWidth, className)} {...linkProps}>
         {icon}
         {children}
      </Link>
   );
}

export default LinkButton;
