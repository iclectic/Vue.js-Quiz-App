import { ref, watch, type Ref } from 'vue'

/**
 * Simple composable for syncing reactive state with localStorage
 * @param key - localStorage key
 * @param defaultValue - default value if key doesn't exist
 * @returns reactive ref that syncs with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): Ref<T> {
  // Read from localStorage
  const read = (): T => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item)
    } catch (error) {
      // console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // Write to localStorage
  const write = (value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // console.warn(`Error writing localStorage key "${key}":`, error)
    }
  }

  // Create reactive ref
  const storedValue = read()
  const state = ref(storedValue) as Ref<T>

  // Watch for changes and sync to localStorage
  watch(
    state,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  return state
}
