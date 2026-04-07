# Vue Composition API Best Practices

## Setup Function
- Use `<script setup>` syntax for concise single-file components.
- Group reactive state declarations at the top, followed by computed, then watchers.

## Composables
- Extract shared logic into `use*` composables under `src/composables/`.
- Each composable should have a single responsibility.
- Always return reactive refs, not raw values.

## Reactivity
- Prefer `ref()` for primitives, `reactive()` for objects.
- Use `toRefs()` when destructuring reactive objects to preserve reactivity.
- Avoid mutating props directly; emit events instead.

## Lifecycle
- Prefer `onMounted`, `onUnmounted` over Options API equivalents.
- Clean up side effects (event listeners, timers) in `onUnmounted`.
