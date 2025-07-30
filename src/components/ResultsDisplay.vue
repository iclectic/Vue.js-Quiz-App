<template>
  <div
    class="results-container"
    role="region"
    aria-labelledby="results-title"
    tabindex="-1"
  >
    <h2
      id="results-title"
      class="results-title"
    >
      🎉 Quiz Complete!
    </h2>
    
    <!-- Overall Score Circle -->
    <ScoreCircle 
      :score="score"
      :total="totalQuestions"
      :percentage="scorePercentage"
    />
    
    <!-- Performance Stats -->
    <PerformanceStats 
      :completion-time="completionTime"
      :accuracy="scorePercentage"
    />
    
    <!-- Category Breakdown -->
    <CategoryBreakdown 
      :category-data="categoryBreakdown"
    />
    
    <!-- Retry Button -->
    <button
      class="retry-button"
      aria-label="Restart the quiz"
      @click="handleRetry"
    >
      {{ scorePercentage === 100 ? '🏆 Perfect! Try Again?' : '🔄 Try Again' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import ScoreCircle from './ScoreCircle.vue'
import PerformanceStats from './PerformanceStats.vue'
import CategoryBreakdown from './CategoryBreakdown.vue'
import type { CategoryBreakdown as CategoryBreakdownType } from '../types/quiz'

interface Props {
  score: number
  totalQuestions: number
  scorePercentage: number
  completionTime: number | null
  categoryBreakdown: CategoryBreakdownType
}

interface Emits {
  (e: 'retry-quiz'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleRetry = () => {
  emit('retry-quiz')
}
</script>

<style scoped>
.results-container {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.results-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.retry-button {
  width: 100%;
  max-width: 300px;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2rem;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .results-container {
    padding: 1.5rem;
  }
  
  .results-title {
    font-size: 2rem;
  }
}
</style>
