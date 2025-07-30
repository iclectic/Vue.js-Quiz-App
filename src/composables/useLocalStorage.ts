import { ref, watch, type Ref } from 'vue'

/**
 * Composable for syncing reactive state with localStorage
 * @param key - localStorage key
 * @param defaultValue - default value if key doesn't exist
 * @returns reactive ref that syncs with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  serializer = {
    read: (value: string): T => {
      try {
        return JSON.parse(value)
      } catch {
        return value as T
      }
    },
    write: (value: T): string => JSON.stringify(value)
  }
): [Ref<T>, (value: T) => void, () => void] {
  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue !== null 
    ? serializer.read(storedValue) 
    : defaultValue

  const state = ref<T>(initialValue)

  const setState = (value: T): void => {
    state.value = value
    localStorage.setItem(key, serializer.write(value))
  }

  const removeState = (): void => {
    localStorage.removeItem(key)
    state.value = defaultValue
  }

  // Watch for changes and sync to localStorage
  watch(
    state,
    (newValue) => {
      localStorage.setItem(key, serializer.write(newValue))
    },
    { deep: true }
  )

  return [state, setState, removeState]
}
