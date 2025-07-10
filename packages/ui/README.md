# @template/ui

Shared UI component library for the Template monorepo.

## 📦 Installation

This package is part of the monorepo and is automatically linked when you run `pnpm install` at the root.

## 🎨 Components

### Layout Components

- `Header` - Application header
- `Footer` - Application footer
- `Layout` - Main layout wrapper
- `Container` - Responsive container

### Form Components

- `Button` - Button component with variants
- `Input` - Text input component
- `Select` - Select dropdown component
- `Checkbox` - Checkbox component
- `Radio` - Radio button component
- `Form` - Form wrapper with validation support

### Feedback Components

- `Alert` - Alert messages
- `Toast` - Toast notifications
- `Spinner` - Loading spinner
- `Skeleton` - Skeleton loader

### Data Display

- `Card` - Card container
- `Table` - Data table
- `List` - List component
- `Badge` - Status badges

### Navigation

- `Tabs` - Tab navigation
- `Breadcrumb` - Breadcrumb navigation
- `Pagination` - Pagination component

## 🚀 Usage

```tsx
import { Button, Card, Alert } from '@template/ui';

function MyComponent() {
  return (
    <Card>
      <Alert type="info">Welcome to the template!</Alert>
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

## 🎨 Styling

This package uses Tailwind CSS for styling. All components are designed to be:

- Fully responsive
- Accessible (WCAG 2.1 AA compliant)
- Theme-able via CSS variables
- Dark mode compatible

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📚 Storybook

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

## 🛠️ Development

When developing new components:

1. Create the component in `src/components/`
2. Export it from `src/index.ts`
3. Add tests in `__tests__/`
4. Add Storybook stories in `stories/`
5. Update this README with the new component

## 📝 Guidelines

- All components must be TypeScript-first
- Include proper JSDoc comments
- Follow accessibility best practices
- Ensure mobile-first responsive design
- Write comprehensive tests
