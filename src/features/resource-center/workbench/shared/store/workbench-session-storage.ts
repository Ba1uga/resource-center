export type WorkbenchStorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const STORAGE_KEY_PREFIX = 'resource-center:'

const buildStorageKey = (key: string) => `${STORAGE_KEY_PREFIX}${key}`

const deepCloneJsonValue = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const cloneFallbackState = <T extends Record<string, unknown>>(fallback: T): T => {
  try {
    return deepCloneJsonValue(fallback)
  } catch {
    return {
      ...fallback,
    }
  }
}

const resolveWorkbenchStorage = (storage?: WorkbenchStorageLike): WorkbenchStorageLike | null => {
  if (storage) {
    return storage
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    return null
  }

  return null
}

export const createInMemoryWorkbenchStorage = (): WorkbenchStorageLike => {
  const memoryStorage = new Map<string, string>()

  return {
    getItem(key) {
      return memoryStorage.get(key) ?? null
    },
    setItem(key, value) {
      memoryStorage.set(key, value)
    },
  }
}

export const loadWorkbenchSessionState = <T extends Record<string, unknown>>(
  key: string,
  fallback: T,
  storage?: WorkbenchStorageLike,
): T => {
  const resolvedStorage = resolveWorkbenchStorage(storage)

  if (!resolvedStorage) {
    return cloneFallbackState(fallback)
  }

  let rawValue: string | null
  try {
    rawValue = resolvedStorage.getItem(buildStorageKey(key))
  } catch {
    return cloneFallbackState(fallback)
  }

  if (!rawValue) {
    return cloneFallbackState(fallback)
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return cloneFallbackState(fallback)
    }

    return deepCloneJsonValue({
      ...fallback,
      ...parsedValue,
    })
  } catch {
    return cloneFallbackState(fallback)
  }
}

export const saveWorkbenchSessionState = <T>(
  key: string,
  value: T,
  storage?: WorkbenchStorageLike,
): void => {
  const resolvedStorage = resolveWorkbenchStorage(storage)

  if (!resolvedStorage) {
    return
  }

  try {
    resolvedStorage.setItem(buildStorageKey(key), JSON.stringify(value))
  } catch {
    // Ignore storage failures so persistence cannot break store behavior.
  }
}
