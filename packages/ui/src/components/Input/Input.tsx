import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import cn from '../../utils/cn';

const inputVariants = cva('template-input-base', {
  variants: {
    variant: {
      default: 'border-secondary-200 focus:ring-primary-500',
      error: 'border-error-300 focus:ring-error-500 focus:border-error-500',
      success:
        'border-success-300 focus:ring-success-500 focus:border-success-500',
    },
    size: {
      default: 'h-10 px-3 py-2',
      sm: 'h-8 px-2 py-1 text-sm',
      lg: 'h-12 px-4 py-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Icon to display before the input text
   */
  icon?: React.ReactNode;
  /**
   * Icon to display after the input text
   */
  iconRight?: React.ReactNode;
  /**
   * Whether the input is required
   */
  required?: boolean;
}

/**
 * Input component - A flexible input component with validation states
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   required
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = 'text',
      label,
      helperText,
      error,
      icon,
      iconRight,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    // Determine variant based on error prop
    const effectiveVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-secondary-700"
          >
            {label}
            {required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-secondary-400">{icon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant: effectiveVariant, size }),
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            aria-describedby={cn(helperId, errorId)}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />

          {iconRight && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-secondary-400">{iconRight}</span>
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-error-600" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
