<template>
  <div class="category-breakdown">
    <h3 class="breakdown-title">
      📈 Performance by Category
    </h3>
    <div class="category-grid">
      <div 
        v-for="(stats, category) in categoryData" 
        :key="category" 
        class="category-card"
      >
        <div class="category-header">
          <span class="category-name">{{ category }}</span>
          <span class="category-percentage">{{ getPercentage(stats) }}%</span>
        </div>
        
        <div class="category-progress">
          <div class="category-bar">
            <div 
              class="category-fill" 
              :style="{ 
                width: getPercentage(stats) + '%',
                backgroundColor: getBarColor(getPercentage(stats))
              }"
            />
          </div>
          <span class="category-score">{{ stats.correct }}/{{ stats.total }}</span>
        </div>
        
        <div class="category-grade">
          Grade: <span
            class="grade-badge"
            :class="getGradeClass(getPercentage(stats))"
          >
            {{ getGrade(getPercentage(stats)) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryBreakdown } from '../types/quiz'

interface Props {
  categoryData: CategoryBreakdown
}

defineProps<Props>()

const getPercentage = (stats: { correct: number, total: number }): number => {
  if (stats.total === 0) return 0
  return Math.round((stats.correct / stats.total) * 100)
}

const getBarColor = (percentage: number): string => {
  if (percentage >= 80) return '#10B981'
  if (percentage >= 60) return '#F59E0B'
  return '#EF4444'
}

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}

const getGradeClass = (percentage: number): string => {
  if (percentage >= 80) return 'grade-excellent'
  if (percentage >= 60) return 'grade-good'
  return 'grade-needs-work'
}
</script>

<style scoped>
.category-breakdown {
  margin: 2.5rem 0;
  text-align: left;
}

.breakdown-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #667eea;
  font-weight: 600;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: linear-gradient(135deg, #3a2f47 0%, #2d1b3d 100%);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #fff;
}

.category-percentage {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-bar {
  flex: 1;
  height: 10px;
  background-color: #271C36;
  border-radius: 5px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 5px;
}

.category-score {
  font-size: 0.9rem;
  color: #8f8f8f;
  min-width: 50px;
  text-align: right;
  font-weight: 500;
}

.category-grade {
  text-align: center;
  font-size: 0.9rem;
  color: #8f8f8f;
}

.grade-badge {
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grade-excellent {
  background-color: #10B981;
  color: white;
}

.grade-good {
  background-color: #F59E0B;
  color: white;
}

.grade-needs-work {
  background-color: #EF4444;
  color: white;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .category-card {
    padding: 1.25rem;
  }
}
</style>
