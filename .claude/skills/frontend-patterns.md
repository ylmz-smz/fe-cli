# Frontend Patterns

## Component Design
- Prefer functional components with hooks (React) or Composition API (Vue).
- Single Responsibility Principle: one component = one concern.
- Extract reusable logic into custom hooks / composables.

## State Management
- Keep state as close to where it is used as possible.
- Use derived state instead of duplicating data.
- Avoid deeply nested state; flatten when possible.

## Performance
- Memoize expensive computations (useMemo / computed).
- Use lazy loading for routes and heavy components.
- Avoid unnecessary re-renders by stabilizing references.