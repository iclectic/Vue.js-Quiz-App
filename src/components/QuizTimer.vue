<template>
  <div
    class="quiz-timer"
    :class="timerClass"
  >
    <div class="timer-container" role="region" aria-labelledby="timer-title">
      <h2 id="timer-title" class="visually-hidden">Quiz Timer</h2>
      <svg
        class="timer-svg"
        viewBox="0 0 100 100"
        aria-label="Time remaining: {{ formattedTime }}"
        role="img"
        focusable="false"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          class="timer-background"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          class="timer-progress"
          :style="{ strokeDashoffset: strokeDashoffset }"
        />
      </svg>
      <div class="timer-content">
        <div class="timer-time">
          {{ formattedTime }}
        </div>
        <div class="timer-label">
          {{ timeLabel }}
        </div>
      </div>
      <div class="timer-info" aria-live="polite">
        <span class="time-label">Time Remaining:</span>
        <span class="time-value" :class="{ warning: isWarning, critical: isCritical }">
          {{ formattedTime }}
        </span>
      </div>
      <div
        v-if="showControls"
        class="timer-controls"
      >
        <button 
          class="timer-btn" 
          :class="{ 'paused': !isActive }"
          @click="toggleTimer"
          :aria-label="!isActive ? 'Resume timer' : 'Pause timer'"
        >
          {{ !isActive ? 'Resume' : 'Pause' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  timeRemaining: number
  timePercentage: number
  formattedTime: string
  isActive: boolean
  isWarning: boolean
  isCritical: boolean
  showControls?: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'timeUp'): void
}

const props = withDefaults(defineProps<Props>(), {
  showControls: false
})

const emit = defineEmits<Emits>()

const circumference = 2 * Math.PI * 45 // radius = 45

const strokeDashoffset = computed(() => {
  const progress = props.timePercentage / 100
  return circumference * (1 - progress)
})

const timerClass = computed(() => ({
  'timer-warning': props.isWarning && !props.isCritical,
  'timer-critical': props.isCritical,
  'timer-paused': !props.isActive && props.timeRemaining > 0
}))

const timeLabel = computed(() => {
  if (props.isCritical) return 'HURRY!'
  if (props.isWarning) return 'Warning'
  return 'Time Left'
})

const toggleTimer = (): void => {
  emit('toggle')
}

// Watch for time up
watch(() => props.timeRemaining, (newTime) => {
  if (newTime === 0) {
    emit('timeUp')
  }
})
</script>

<style scoped>
.quiz-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.timer-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-background {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283; /* 2 * π * 45 */
  transition: all 0.3s ease;
}

.timer-warning .timer-progress {
  stroke: #f59e0b;
}

.timer-critical .timer-progress {
  stroke: #ef4444;
  animation: pulse-critical 1s infinite;
}

.timer-paused .timer-progress {
  stroke: #6b7280;
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-time {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.timer-warning .timer-time {
  color: #f59e0b;
}

.timer-critical .timer-time {
  color: #ef4444;
  animation: pulse-text 1s infinite;
}

.timer-paused .timer-time {
  color: #6b7280;
}

@keyframes pulse-text {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.timer-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-critical .timer-label {
  color: #ef4444;
  font-weight: 700;
}

.timer-controls {
  display: flex;
  gap: 0.5rem;
}

.timer-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timer-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.timer-btn.paused {
  background: #3b82f6;
  color: white;
}

.timer-btn.paused:hover {
  background: #2563eb;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .timer-circle {
    width: 100px;
    height: 100px;
  }
  
  .timer-time {
    font-size: 1.1rem;
  }
  
  .timer-label {
    font-size: 0.7rem;
  }
}
</style>
