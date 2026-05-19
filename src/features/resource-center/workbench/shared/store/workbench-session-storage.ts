export type WorkbenchStorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const STORAGE_KEY_PREFIX = 'resource-center:'

const buildStorageKey = (key: string) => `${STORAGE_KEY_PREFIX}${key}`

const resolveWorkbenchStorage = (storage?: WorkbenchStorageLike): WorkbenchStorageLike | null => {
  if (storage) {
    return storage
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
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
    return fallback
  }

  const rawValue = resolvedStorage.getItem(buildStorageKey(key))
  if (!rawValue) {
    return fallback
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return fallback
    }

    return {
      ...fallback,
      ...parsedValue,
    }
  } catch {
    return fallback
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

  resolvedStorage.setItem(buildStorageKey(key), JSON.stringify(value))
}
