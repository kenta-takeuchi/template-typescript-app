import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card data-testid="card">Card content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('template-card-base');
      expect(card).toHaveTextContent('Card content');
    });

    it('renders different variants', () => {
      const { rerender } = render(
        <Card data-testid="card" variant="default">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass(
        'bg-white',
        'border-secondary-200'
      );

      rerender(
        <Card data-testid="card" variant="outlined">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass(
        'border-secondary-300',
        'shadow-none'
      );

      rerender(
        <Card data-testid="card" variant="elevated">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('shadow-soft-lg');

      rerender(
        <Card data-testid="card" variant="ghost">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass(
        'bg-transparent',
        'border-transparent'
      );
    });

    it('renders different padding variants', () => {
      const { rerender } = render(
        <Card data-testid="card" padding="none">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('p-0');

      rerender(
        <Card data-testid="card" padding="sm">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('p-4');

      rerender(
        <Card data-testid="card" padding="default">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('p-6');

      rerender(
        <Card data-testid="card" padding="lg">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('p-8');
    });

    it('applies custom className', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('template-card-base');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardHeader', () => {
    it('renders with default styling', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);

      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'pb-6');
    });

    it('applies custom className', () => {
      render(
        <CardHeader data-testid="header" className="custom-header">
          Header
        </CardHeader>
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header', 'flex', 'flex-col');
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 by default', () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
      expect(title).toHaveClass('template-text-heading');
    });

    it('renders with different heading levels', () => {
      const { rerender } = render(<CardTitle as="h1">Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      rerender(<CardTitle as="h2">Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

      rerender(<CardTitle as="h4">Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);

      const title = screen.getByRole('heading');
      expect(title).toHaveClass('custom-title', 'template-text-heading');
    });
  });

  describe('CardDescription', () => {
    it('renders with default styling', () => {
      render(<CardDescription>Card description</CardDescription>);

      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('template-text-muted');
      expect(description.tagName).toBe('P');
    });

    it('applies custom className', () => {
      render(
        <CardDescription className="custom-desc">Description</CardDescription>
      );

      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc', 'template-text-muted');
    });
  });

  describe('CardContent', () => {
    it('renders with default styling', () => {
      render(<CardContent data-testid="content">Card content</CardContent>);

      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('pt-0');
    });

    it('applies custom className', () => {
      render(
        <CardContent data-testid="content" className="custom-content">
          Content
        </CardContent>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders with default styling', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);

      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'pt-6');
    });

    it('applies custom className', () => {
      render(
        <CardFooter data-testid="footer" className="custom-footer">
          Footer
        </CardFooter>
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer', 'flex', 'items-center');
    });
  });

  describe('Complete Card Structure', () => {
    it('renders complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Test Card' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('This is a test card description')
      ).toBeInTheDocument();
      expect(
        screen.getByText('This is the main content of the card.')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Action Button' })
      ).toBeInTheDocument();
    });
  });
});
