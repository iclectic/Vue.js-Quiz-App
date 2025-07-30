<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: progress + '%' }"
      />
    </div>
    <span class="progress-text">{{ current }} / {{ total }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number
  current: number
  total: number
}

defineProps<Props>()
</script>

<style scoped>
.progress-container {
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #3a2f47;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #8f8f8f;
  min-width: 60px;
}
</style>
