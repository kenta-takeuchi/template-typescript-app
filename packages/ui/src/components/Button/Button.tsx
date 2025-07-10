import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import cn from '../../utils/cn';

const buttonVariants = cva('template-button-base', {
  variants: {
    variant: {
      default:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      destructive:
        'bg-error-600 text-white hover:bg-error-700 active:bg-error-800',
      outline:
        'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100',
      secondary:
        'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300',
      ghost:
        'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200',
      link: 'text-primary-600 underline-offset-4 hover:underline active:text-primary-700',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Whether the button should render as a child element
   */
  asChild?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display before the button text
   */
  icon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  iconRight?: React.ReactNode;
}

/**
 * Button component - A versatile button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="default" size="lg">
 *   Click me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const content = (
      <>
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && iconRight && <span className="ml-2">{iconRight}</span>}
      </>
    );

    if (asChild) {
      // This would typically use a Slot component from Radix UI
      // For now, we'll just render the children directly
      return React.cloneElement(children as React.ReactElement, {
        className: cn(buttonVariants({ variant, size }), className),
        disabled: isDisabled,
        ref,
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
