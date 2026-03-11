export const statusCodes: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
}

/** Omite created_at y updated_at de un objeto o array para no exponerlos en respuestas API. */
export function omitTimestamps<T extends Record<string, unknown>>(
  data: T | T[],
): Omit<T, 'created_at' | 'updated_at'> | Omit<T, 'created_at' | 'updated_at'>[] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      omitTimestamps(item as T),
    ) as Omit<T, 'created_at' | 'updated_at'>[]
  }
  const { created_at, updated_at, ...rest } = data
  return rest as Omit<T, 'created_at' | 'updated_at'>
}

/** Omite un conjunto de keys de un objeto o array (shallow). */
export function omitKeys<T extends Record<string, unknown>, K extends keyof T>(
  data: T | T[],
  keys: readonly K[],
): Omit<T, K> | Omit<T, K>[] {
  if (Array.isArray(data)) {
    return data.map((item) => omitKeys(item as T, keys)) as Omit<T, K>[]
  }

  const out: Record<string, unknown> = { ...data }
  for (const k of keys) {
    delete out[k as string]
  }
  return out as Omit<T, K>
}

/** Igual que omitTimestamps pero recursivo: también quita timestamps en objetos anidados y arrays. */
export function omitTimestampsDeep<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => omitTimestampsDeep(item)) as T
  }
  if (data !== null && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const { created_at, updated_at, ...rest } = obj
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(rest)) {
      out[k] = v !== null && typeof v === 'object' ? omitTimestampsDeep(v) : v
    }
    return out as T
  }
  return data
}