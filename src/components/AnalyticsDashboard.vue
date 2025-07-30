<template>
  <div class="analytics-dashboard">
    <h2>📊 Analytics Dashboard</h2>
    <div
      v-if="history.results.length === 0"
      class="empty-msg"
    >
      No quiz history yet. Complete a quiz to see analytics!
    </div>
    <div v-else>
      <div class="chart-section">
        <canvas ref="scoreChart" />
      </div>
      <div class="chart-section">
        <canvas ref="categoryChart" />
      </div>
      <div class="chart-section">
        <canvas ref="timingChart" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEnhancedQuizStore } from '../stores/enhancedQuizStore'
import Chart from 'chart.js/auto'

const store = useEnhancedQuizStore()
const history = store.history

const scoreChart = ref<HTMLCanvasElement | null>(null)
const categoryChart = ref<HTMLCanvasElement | null>(null)
const timingChart = ref<HTMLCanvasElement | null>(null)

function renderCharts() {
  if (!scoreChart.value || !categoryChart.value || !timingChart.value) return

  // Destroy existing charts if present
  Chart.getChart(scoreChart.value)?.destroy()
  Chart.getChart(categoryChart.value)?.destroy()
  Chart.getChart(timingChart.value)?.destroy()

  // Score Over Time
  new Chart(scoreChart.value, {
    type: 'line',
    data: {
      labels: history.results.map(r => new Date(r.date).toLocaleDateString()),
      datasets: [{
        label: 'Score (%)',
        data: history.results.map(r => r.scorePercentage),
        fill: false,
        borderColor: '#667eea',
        tension: 0.2
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 100 } }
    }
  })

  // Category Breakdown (last quiz)
  const last = history.results[0]
  new Chart(categoryChart.value, {
    type: 'bar',
    data: {
      labels: Object.keys(last.categoryBreakdown),
      datasets: [{
        label: 'Correct',
        data: Object.values(last.categoryBreakdown).map(c => c.correct),
        backgroundColor: '#764ba2'
      }, {
        label: 'Total',
        data: Object.values(last.categoryBreakdown).map(c => c.total),
        backgroundColor: '#e0e0e0'
      }]
    },
    options: { plugins: { legend: { display: true } } }
  })

  // Time Per Question (last quiz)
  new Chart(timingChart.value, {
    type: 'bar',
    data: {
      labels: last.answerHistory.map((a, i) => `Q${i+1}`),
      datasets: [{
        label: 'Time (s)',
        data: last.answerHistory.map(a => a.timeSpent),
        backgroundColor: '#667eea'
      }]
    },
    options: { plugins: { legend: { display: false } } }
  })
}

onMounted(renderCharts)
watch(() => history.results, renderCharts, { deep: true })
</script>

<style scoped>
.analytics-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255,255,255,0.05);
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}
.chart-section {
  margin-bottom: 2.5rem;
}
canvas {
  width: 100% !important;
  max-width: 700px;
  height: 320px !important;
}
.empty-msg {
  text-align: center;
  color: #888;
  font-size: 1.2rem;
}
</style>
