# React State Management

## Redux Toolkit
- Use `createSlice` for reducers.
- Use `createAsyncThunk` for async operations.
- Keep slices under `src/store/slices/`.

## Zustand
- One store per domain with `create()`.
- Use selectors to avoid unnecessary re-renders.
- Keep stores in `src/stores/`.

## General Principles
- Colocate state with the component that owns it.
- Lift state only when needed by siblings.
- Server state (API data) belongs in a data-fetching library (TanStack Query, SWR), not in global state.
