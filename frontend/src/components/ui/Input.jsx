import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ className, error, label, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          "flex h-10 w-full rounded-lg border bg-white dark:bg-surface-950 px-3 py-2 text-sm text-surface-900 dark:text-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-surface-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error 
            ? "border-red-500 focus-visible:ring-red-500" 
            : "border-surface-300 dark:border-surface-700 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
