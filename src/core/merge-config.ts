import deepmerge from 'deepmerge';

/**
 * Deep-merge two objects. Arrays of objects with `id` fields are merged
 * by id (idempotent append), plain arrays are deduplicated.
 */
export function mergeConfig<T>(base: T, incoming: Partial<T>): T {
  return deepmerge(base as any, incoming as any, {
    arrayMerge: idempotentArrayMerge,
  }) as T;
}

function idempotentArrayMerge(target: unknown[], source: unknown[]): unknown[] {
  if (isIdArray(target) || isIdArray(source)) {
    return mergeById(target as HasId[], source as HasId[]);
  }
  return [...new Set([...target, ...source])];
}

interface HasId {
  id: string;
  [key: string]: unknown;
}

function isIdArray(arr: unknown[]): arr is HasId[] {
  return arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && 'id' in arr[0];
}

function mergeById(target: HasId[], source: HasId[]): HasId[] {
  const map = new Map<string, HasId>();
  for (const item of target) map.set(item.id, item);
  for (const item of source) {
    const existing = map.get(item.id);
    map.set(item.id, existing ? deepmerge(existing, item) : item);
  }
  return [...map.values()];
}
