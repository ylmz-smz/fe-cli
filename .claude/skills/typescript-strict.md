# TypeScript Strict Mode Guidelines

- Enable `strict: true` in tsconfig.json.
- Never use `any`; prefer `unknown` and narrow with type guards.
- Use discriminated unions for state variants.
- Use `satisfies` for inline type validation without widening.
- Prefer `as const` for literal types.
- Always handle all switch/union cases (exhaustive checks).