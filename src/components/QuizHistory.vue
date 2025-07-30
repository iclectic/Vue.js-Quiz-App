<template>
  <div class="quiz-history">
    <div class="history-header">
      <h2>Quiz History</h2>
      <div class="history-stats">
        <div class="stat-card">
          <span class="stat-value">{{ history.totalQuizzes }}</span>
          <span class="stat-label">Total Quizzes</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ history.bestScore }}%</span>
          <span class="stat-label">Best Score</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ Math.round(history.averageScore) }}%</span>
          <span class="stat-label">Average Score</span>
        </div>
      </div>
    </div>

    <div
      v-if="history.results.length > 0"
      class="history-content"
    >
      <div class="results-grid">
        <div 
          v-for="result in sortedResults" 
          :key="result.id"
          class="result-card"
          :class="getResultClass(result.scorePercentage)"
        >
          <div class="result-header">
            <div class="result-score">
              {{ result.scorePercentage }}%
            </div>
            <div class="result-date">
              {{ formatDate(result.date) }}
            </div>
          </div>
          
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Questions:</span>
              <span class="detail-value">{{ result.score }}/{{ result.totalQuestions }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">{{ formatTime(result.completionTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Difficulty:</span>
              <span class="detail-value">{{ result.settings.difficulty }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">{{ result.settings.category }}</span>
            </div>
          </div>

          <div class="result-breakdown">
            <div class="breakdown-title">
              Category Performance
            </div>
            <div class="breakdown-bars">
              <div 
                v-for="(stats, category) in result.categoryBreakdown" 
                :key="category"
                class="breakdown-bar"
              >
                <span class="breakdown-label">{{ category }}</span>
                <div class="breakdown-progress">
                  <div 
                    class="breakdown-fill"
                    :style="{ 
                      width: `${getPercentage(stats)}%`,
                      backgroundColor: getBarColor(getPercentage(stats))
                    }"
                  />
                </div>
                <span class="breakdown-percentage">{{ getPercentage(stats) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        📊
      </div>
      <h3>No Quiz History Yet</h3>
      <p>Complete your first quiz to see your performance history here!</p>
    </div>

    <div
      v-if="history.results.length > 0"
      class="history-actions"
    >
      <button
        class="btn btn-danger"
        @click="clearHistory"
      >
        Clear History
      </button>
      <button
        class="btn btn-secondary"
        @click="exportHistory"
      >
        Export Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuizHistory } from '../types/quiz'

interface Props {
  history: QuizHistory
}

interface Emits {
  (e: 'clear-history'): void
  (e: 'export-history'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sortedResults = computed(() => {
  return [...props.history.results].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

const getResultClass = (percentage: number): string => {
  if (percentage >= 90) return 'result-excellent'
  if (percentage >= 80) return 'result-good'
  if (percentage >= 70) return 'result-average'
  return 'result-poor'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getPercentage = (stats: { correct: number, total: number }): number => {
  if (stats.total === 0) return 0
  return Math.round((stats.correct / stats.total) * 100)
}

const getBarColor = (percentage: number): string => {
  if (percentage >= 80) return '#10B981'
  if (percentage >= 60) return '#F59E0B'
  return '#EF4444'
}

const clearHistory = (): void => {
  if (confirm('Are you sure you want to clear all quiz history? This action cannot be undone.')) {
    emit('clear-history')
  }
}

const exportHistory = (): void => {
  emit('export-history')
}
</script>

<style scoped>
.quiz-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.history-header {
  text-align: center;
  margin-bottom: 3rem;
}

.history-header h2 {
  color: #1f2937;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.history-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.result-excellent {
  border-left-color: #10B981;
}

.result-good {
  border-left-color: #3B82F6;
}

.result-average {
  border-left-color: #F59E0B;
}

.result-poor {
  border-left-color: #EF4444;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.result-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.result-date {
  font-size: 0.9rem;
  color: #6b7280;
}

.result-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #1f2937;
  font-weight: 600;
}

.result-breakdown {
  margin-top: 1rem;
}

.breakdown-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.breakdown-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.breakdown-label {
  font-size: 0.8rem;
  color: #6b7280;
  min-width: 80px;
}

.breakdown-progress {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.breakdown-percentage {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  min-width: 35px;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.history-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .quiz-history {
    padding: 1rem;
  }
  
  .history-stats {
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
    min-width: 100px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .result-card {
    padding: 1rem;
  }
}
</style>
