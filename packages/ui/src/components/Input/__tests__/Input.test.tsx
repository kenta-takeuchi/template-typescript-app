import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Input } from '../Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('template-input-base');
  });

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);

    const label = screen.getByText('Email');
    const input = screen.getByLabelText('Email');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', expect.any(String));
  });

  it('renders required indicator', () => {
    render(<Input label="Email" required />);

    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass('text-error-500');
  });

  it('renders helper text', () => {
    render(<Input helperText="This is helpful information" />);

    const helperText = screen.getByText('This is helpful information');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-secondary-500');
  });

  it('renders error state', () => {
    render(<Input error="This field is required" />);

    const errorMessage = screen.getByRole('alert');
    const input = screen.getByRole('textbox');

    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('This field is required');
    expect(errorMessage).toHaveClass('text-error-600');
    expect(input).toHaveClass('border-error-300');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('error takes precedence over helper text', () => {
    render(<Input helperText="Helper text" error="Error message" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(<Input variant="default" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-secondary-200');

    rerender(<Input variant="success" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-success-300');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Input size="default" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-10');

    rerender(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-8');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-12');
  });

  it('renders with icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">🔍</span>;
    const RightIcon = () => <span data-testid="right-icon">✓</span>;

    render(<Input icon={<LeftIcon />} iconRight={<RightIcon />} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10', 'pr-10');
  });

  it('handles different input types', () => {
    render(<Input type="email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveClass('template-input-base');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('sets up proper ARIA relationships', () => {
    render(
      <Input
        label="Email"
        helperText="Enter your email address"
        id="email-input"
      />
    );

    const input = screen.getByRole('textbox');
    const helperText = screen.getByText('Enter your email address');

    expect(input).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(helperText.id)
    );
  });

  it('sets up proper ARIA relationships with error', () => {
    render(<Input label="Email" error="Email is required" id="email-input" />);

    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByRole('alert');

    expect(input).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(errorMessage.id)
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
