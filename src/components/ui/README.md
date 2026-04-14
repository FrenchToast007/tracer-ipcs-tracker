# UI Components Library

A complete, production-ready shadcn/ui component library built with React, TypeScript, Tailwind CSS, and Radix UI primitives.

## File Structure

```
src/components/ui/
├── accordion.tsx          # Accordion with animated items
├── badge.tsx              # Badge with multiple variants
├── button.tsx             # Button with variants and sizes
├── card.tsx               # Card container and sub-components
├── checkbox.tsx           # Checkbox input component
├── collapsible.tsx        # Collapsible content wrapper
├── dialog.tsx             # Modal dialog component
├── input.tsx              # Text input field
├── label.tsx              # Form label component
├── progress.tsx           # Progress bar
├── scroll-area.tsx        # Custom scrollable area
├── select.tsx             # Select dropdown component
├── separator.tsx          # Visual separator line
├── switch.tsx             # Toggle switch component
├── tabs.tsx               # Tabbed content panel
├── textarea.tsx           # Multi-line text input
├── tooltip.tsx            # Tooltip component
└── index.ts               # Centralized exports
```

## Component Categories

### Form Controls
- **Input** - Text input field
- **Textarea** - Multi-line text input
- **Checkbox** - Checkbox input
- **Switch** - Toggle switch
- **Select** - Dropdown select
- **Label** - Form label

### Display Components
- **Card** - Container component with header/content/footer
- **Badge** - Status badges
- **Progress** - Progress bar
- **Separator** - Visual separator

### Interactive Components
- **Button** - Clickable button with variants
- **Tabs** - Tabbed content panel
- **Accordion** - Expandable content sections
- **Collapsible** - Simple expandable content
- **Dialog** - Modal dialog

### Presentation Components
- **Tooltip** - Hover tooltips
- **ScrollArea** - Custom scrollable area

## Quick Start

### Basic Import
```typescript
import { Button, Card, Input } from '@/components/ui'
```

### With Individual Files
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
```

## Component Examples

### Button with Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Card Layout
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Form Example
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="name">Name</Label>
    <Input id="name" placeholder="Enter name" />
  </div>
  <div>
    <Label htmlFor="message">Message</Label>
    <Textarea id="message" placeholder="Enter message" />
  </div>
  <Button>Submit</Button>
</div>
```

## Styling & Customization

All components use:
- **Tailwind CSS v4** for base styling
- **CVA (class-variance-authority)** for variant management
- **cn()** utility for className merging
- CSS variables for theming

### Custom Styling
```tsx
// Override with className
<Button className="bg-custom-color">Custom</Button>

// Combine with variants
<Button variant="outline" className="text-lg">Large Outline</Button>
```

## Accessibility Features

- ARIA attributes properly applied
- Keyboard navigation support
- Focus management
- Screen reader compatible
- High contrast support

## Type Safety

All components are fully typed with TypeScript:
- Component props are properly typed
- Forward refs work with TypeScript
- Variant props are union types
- Full IDE autocomplete support

## Dependencies

### Peer Dependencies
- `react` >= 18
- `react-dom` >= 18

### Required Dependencies
- `@radix-ui/*` - Headless UI primitives
- `class-variance-authority` - Component variants
- `clsx` - Utility for conditional classes
- `tailwind-merge` - Merge Tailwind classes
- `lucide-react` - Icon library

## Browser Support

All components work in modern browsers supporting:
- ES2020+
- CSS Grid/Flexbox
- CSS Variables
- Web Animations API

## Performance

- Minimal bundle size
- No external CSS files
- Tree-shakeable exports
- Optimized animations
- Proper memoization

## Contributing

When adding new components:
1. Use React.forwardRef pattern
2. Export types alongside components
3. Use cn() for className merging
4. Leverage Radix UI primitives when available
5. Add comprehensive JSDoc comments
6. Update index.ts with exports

## License

These components follow shadcn/ui patterns and conventions.
