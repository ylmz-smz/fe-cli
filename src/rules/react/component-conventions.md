# React Component Conventions

## File Naming
- PascalCase for component files: `UserProfile.tsx`.
- Co-locate styles, tests, and types with the component.

## Structure
- Prefer function components with arrow syntax and explicit return types.
- One exported component per file.
- Destructure props in the function signature.

## Props
- Define props with TypeScript interfaces (not `type` aliases for components).
- Use `React.PropsWithChildren<T>` for wrapper components.
- Provide defaults via destructuring default values.

## Composition
- Use children or render props for flexible composition.
- Avoid deeply nested component trees; flatten with composition.
