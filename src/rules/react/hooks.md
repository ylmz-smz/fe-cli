# React Hooks Guidelines

## Rules of Hooks
- Only call hooks at the top level — never inside loops, conditions, or nested functions.
- Only call hooks from React function components or custom hooks.

## Custom Hooks
- Prefix with `use`: `useAuth`, `useFetch`, `useDebounce`.
- Each custom hook should have a single responsibility.
- Return stable references where possible (useCallback, useMemo).

## Common Patterns
- Use `useEffect` cleanup to prevent memory leaks.
- Prefer `useReducer` over `useState` for complex state logic.
- Avoid over-memoization; profile before optimizing.
