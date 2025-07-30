<template>
  <div class="stats-container">
    <div
      v-if="completionTime"
      class="stat-card"
    >
      <div class="stat-icon">
        ⏱️
      </div>
      <div class="stat-content">
        <span class="stat-label">Time Taken</span>
        <span class="stat-value">{{ formatTime(completionTime) }}</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">
        🎯
      </div>
      <div class="stat-content">
        <span class="stat-label">Accuracy</span>
        <span class="stat-value">{{ accuracy }}%</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">
        📊
      </div>
      <div class="stat-content">
        <span class="stat-label">Grade</span>
        <span class="stat-value">{{ getGrade(accuracy) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  completionTime: number | null
  accuracy: number
}

defineProps<Props>()

const formatTime = (seconds: number): string => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}
</script>

<style scoped>
.stats-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, #3a2f47 0%, #2d1b3d 100%);
  padding: 1.5rem;
  border-radius: 1rem;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #8f8f8f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-card {
    width: 100%;
    max-width: 200px;
  }
}
</style>
