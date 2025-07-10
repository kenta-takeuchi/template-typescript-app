import React from 'react';

// Common prop types for UI components
export interface BaseComponentProps {
  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Test ID for testing purposes
   */
  'data-testid'?: string;
}

// Color variants used across components
export type ColorVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

// Size variants used across components
export type SizeVariant = 'sm' | 'default' | 'lg';

// Component state types
export interface ValidationState {
  error?: string;
  helperText?: string;
  required?: boolean;
}

export interface LoadingState {
  loading?: boolean;
  disabled?: boolean;
}

// Event handler types commonly used
export type ClickHandler = (_event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = HTMLInputElement> = (
  _event: React.ChangeEvent<T>
) => void;
export type FocusHandler<T = HTMLElement> = (
  _event: React.FocusEvent<T>
) => void;
