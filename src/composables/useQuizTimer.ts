import { ref, computed, onUnmounted, readonly } from 'vue'

export function useQuizTimer(timeLimit = 300) { // 5 minutes default
  const timeRemaining = ref(timeLimit)
  const isActive = ref(false)
  const intervalId = ref<number | null>(null)

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const timePercentage = computed(() => {
    return (timeRemaining.value / timeLimit) * 100
  })

  const isWarning = computed(() => timeRemaining.value <= 60) // Last minute
  const isCritical = computed(() => timeRemaining.value <= 30) // Last 30 seconds

  const start = (): void => {
    if (isActive.value) return
    
    isActive.value = true
    intervalId.value = window.setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        stop()
      }
    }, 1000)
  }

  const stop = (): void => {
    isActive.value = false
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  const reset = (newTimeLimit?: number): void => {
    stop()
    timeRemaining.value = newTimeLimit || timeLimit
  }

  const pause = (): void => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isActive.value = false
  }

  const resume = (): void => {
    if (!isActive.value && timeRemaining.value > 0) {
      start()
    }
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    stop()
  })

  return {
    timeRemaining: readonly(timeRemaining),
    formattedTime,
    timePercentage,
    isActive: readonly(isActive),
    isWarning,
    isCritical,
    start,
    stop,
    reset,
    pause,
    resume
  }
}
