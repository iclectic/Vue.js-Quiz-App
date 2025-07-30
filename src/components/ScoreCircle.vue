<template>
  <div class="score-summary">
    <div class="score-circle">
      <span class="percentage">{{ percentage }}%</span>
      <span class="fraction">{{ score }}/{{ total }}</span>
    </div>
    <p class="score-message">
      {{ getScoreMessage() }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  score: number
  total: number
  percentage: number
}

const props = defineProps<Props>()

const getScoreMessage = (): string => {
  if (props.percentage === 100) return '🏆 Perfect Score! Outstanding!'
  if (props.percentage >= 90) return '🌟 Excellent work! Almost perfect!'
  if (props.percentage >= 80) return '🎯 Great job! Well done!'
  if (props.percentage >= 70) return '👍 Good performance! Keep it up!'
  if (props.percentage >= 60) return '📚 Not bad! Room for improvement!'
  return '💪 Keep practicing! You\'ll get there!'
}
</script>

<style scoped>
.score-summary {
  margin: 2rem 0;
}

.score-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.score-circle::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.percentage {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.fraction {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  z-index: 1;
  font-weight: 500;
}

.score-message {
  font-size: 1.3rem;
  margin: 1rem 0;
  color: #667eea;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .score-circle {
    width: 150px;
    height: 150px;
  }
  
  .percentage {
    font-size: 2rem;
  }
  
  .score-message {
    font-size: 1.1rem;
  }
}
</style>
