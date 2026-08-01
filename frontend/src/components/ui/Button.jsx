import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Button = forwardRef(({ 
  children, className, variant = 'primary', size = 'md', isLoading = false, disabled, ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
    secondary: "bg-surface-200 text-surface-900 hover:bg-surface-300 dark:bg-surface-800 dark:text-white dark:hover:bg-surface-700",
    outline: "border border-surface-300 text-surface-700 hover:bg-surface-100 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800",
    ghost: "text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
