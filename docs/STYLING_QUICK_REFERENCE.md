# 🎨 Styling Quick Reference

## New CSS Classes Available

### Glassmorphism
```jsx
<div className="glass p-4 rounded-lg">
  Frosted glass effect
</div>
```

### Card Effects
```jsx
<div className="card-elevated">Hover to lift</div>
```

### Gradients
```jsx
<div className="gradient-primary">Primary gradient</div>
<div className="gradient-secondary">Secondary gradient</div>
<div className="gradient-mesh">Mesh gradient</div>
<h1 className="text-gradient">Gradient text</h1>
```

### Hover Effects
```jsx
<div className="hover-lift">Lifts on hover</div>
<div className="hover-scale">Scales on hover</div>
```

### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>
```

### Utilities
```jsx
<div className="skeleton">Loading skeleton</div>
<div className="divider">Horizontal divider</div>
<input className="focus-ring" />
```

## Enhanced Components

### Card
```jsx
// Basic
<Card>Content</Card>

// With elevation
<Card elevated>Content</Card>

// Interactive (clickable)
<Card interactive onClick={fn}>Content</Card>

// Both
<Card elevated interactive>Content</Card>
```

### Button Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Button Variants
```jsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Shadow System

Use in Tailwind classes:
```jsx
<div className="shadow-sm">Subtle</div>
<div className="shadow-md">Medium</div>
<div className="shadow-lg">Large</div>
<div className="shadow-xl">Extra Large</div>
<div className="shadow-2xl">Dramatic</div>
```

## Common Patterns

### Hero Section
```jsx
<div className="gradient-mesh min-h-screen p-8">
  <h1 className="text-gradient text-6xl font-bold">
    Welcome
  </h1>
</div>
```

### Feature Card
```jsx
<Card elevated className="hover-lift">
  <CardHeader>
    <CardTitle>Feature</CardTitle>
  </CardHeader>
  <CardContent>
    Description
  </CardContent>
</Card>
```

### Modal/Dialog
```jsx
<div className="glass p-6 rounded-xl shadow-2xl">
  <h2>Modal Title</h2>
  <p>Content</p>
</div>
```

### Status Badge
```jsx
<span className="badge badge-success">
  Active
</span>
```

### Loading State
```jsx
<div className="skeleton h-20 w-full"></div>
```

## Quick Tips

1. **Use `elevated` on important cards**
2. **Add `interactive` to clickable cards**
3. **Use `glass` for overlays and modals**
4. **Apply `text-gradient` to hero headings**
5. **Use `hover-lift` on feature cards**
6. **Add badges for status indicators**

## Animation Classes

All elements have smooth transitions by default:
- `transition-all duration-200`
- `cubic-bezier(0.4, 0, 0.2, 1)` easing
- `active:scale-95` on buttons

## That's It!

Your app now has professional-grade styling. Just use these classes and components to maintain consistency throughout the app.
