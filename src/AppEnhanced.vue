<template>
  <a
    href="#main-content"
    class="skip-link"
  >Skip to main content</a>
  <div id="app">
    <header
      class="app-header"
      role="banner"
    >
      <div class="header-content">
        <h1 id="app-title">
          Vue.js Quiz App
        </h1>
        <p>Test your knowledge of Data Structures & Algorithms</p>
      </div>
      <button 
        class="theme-toggle" 
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        tabindex="0"
        @click="toggleTheme"
      >
        <span v-if="isDark">🌙 Dark</span>
        <span v-else>☀️ Light</span>
      </button>
      <nav
        class="app-nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <button 
          :class="{ active: currentView === 'quiz' }" 
          class="nav-btn"
          @click="setView('quiz')"
        >
          🧠 Quiz
        </button>
        <button 
          :class="{ active: currentView === 'settings' }" 
          class="nav-btn"
          @click="setView('settings')"
        >
          ⚙️ Settings
        </button>
        <button 
          :class="{ active: currentView === 'history' }" 
          class="nav-btn"
          @click="setView('history')"
        >
          📊 History
        </button>
        <button 
          :class="{ active: currentView === 'analytics' }" 
          class="nav-btn"
          @click="setView('analytics')"
        >
          📈 Analytics
        </button>
      </nav>
    </header>

    <main
      id="main-content"
      class="app-main"
      role="main"
      tabindex="-1"
    >
      <!-- Settings View -->
      <div
        v-if="currentView === 'settings'"
        class="settings-view"
      >
        <QuizSettings 
          :settings="settings"
          @update:settings="updateSettings"
          @save="handleSettingsSaved"
        />
      </div>

      <!-- History View -->
      <div
        v-else-if="currentView === 'history'"
        class="history-view"
      >
        <QuizHistory 
          :history="history"
          @clear-history="clearHistory"
          @export-history="exportHistory"
        />
      </div>

      <!-- Analytics View -->
      <div
        v-else-if="currentView === 'analytics'"
        class="analytics-view"
      >
        <AnalyticsDashboard />
      </div>

      <!-- Quiz View -->
      <div
        v-else
        class="quiz-view"
      >
        <!-- Timer (if enabled and quiz started) -->
        <div
          v-if="settings.showTimer && quizStarted && !quizCompleted"
          class="timer-container"
        >
          <QuizTimer 
            :time-remaining="timeRemaining"
            :time-percentage="timePercentage"
            :formatted-time="formattedTime"
            :is-active="timerActive"
            :is-warning="isWarning"
            :is-critical="isCritical"
            :show-controls="true"
            @toggle="handleTimerToggle"
            @time-up="completeQuiz"
          />
        </div>

        <!-- Quiz not started -->
        <div
          v-if="!quizStarted && !quizCompleted"
          class="quiz-start"
        >
          <div class="start-card">
            <h2>Ready to Test Your Knowledge?</h2>
            <p>Challenge yourself with questions about data structures and algorithms</p>
            <div class="quiz-info">
              <div class="info-item">
                <span class="info-label">Questions:</span>
                <span class="info-value">{{ totalQuestions }}</span>
              </div>
              <div
                v-if="settings.timeLimit > 0"
                class="info-item"
              >
                <span class="info-label">Time Limit:</span>
                <span class="info-value">{{ Math.floor(settings.timeLimit / 60) }} minutes</span>
              </div>
              <div class="info-item">
                <span class="info-label">Difficulty:</span>
                <span class="info-value">{{ settings.difficulty }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Category:</span>
                <span class="info-value">{{ settings.category }}</span>
              </div>
            </div>
            <ProgressBar
              :current="0"
              :total="totalQuestions"
            />
            <button
              class="start-btn"
              @click="startQuiz"
            >
              Start Quiz
            </button>
          </div>
        </div>

        <!-- Quiz in progress -->
        <div
          v-else-if="quizStarted && !quizCompleted"
          class="quiz-active"
        >
          <ProgressBar
            :current="currentQuestionIndex + 1"
            :total="totalQuestions"
          />
          <QuestionCard 
            v-if="currentQuestion"
            :question="currentQuestion"
            :question-index="currentQuestionIndex"
            :is-answered="isAnswered(currentQuestionIndex)"
            :show-hints="settings.showHints"
            :hint-used="hintsUsed[currentQuestion.id] || false"
            @answer-selected="handleAnswerSelected"
            @next-question="nextQuestion"
            @previous-question="previousQuestion"
            @use-hint="handleUseHint"
          />
        </div>

        <!-- Quiz completed -->
        <div
          v-else-if="quizCompleted"
          class="quiz-results"
        >
          <ResultsDisplay 
            :score="score"
            :total-questions="totalQuestions"
            :completion-time="completionTime || 0"
            :category-breakdown="categoryBreakdown"
            @restart-quiz="resetQuiz"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEnhancedQuizStore } from './stores/enhancedQuizStore'
import ProgressBar from './components/ProgressBar.vue'
import QuestionCard from './components/QuestionCard.vue'
import ResultsDisplay from './components/ResultsDisplay.vue'
import QuizSettings from './components/QuizSettings.vue'
import AnalyticsDashboard from './components/AnalyticsDashboard.vue'
import QuizTimer from './components/QuizTimer.vue'
import QuizHistory from './components/QuizHistory.vue'

const store = useEnhancedQuizStore()

// Extract reactive state from store
const {
  currentQuestion,
  currentQuestionIndex,
  quizCompleted,
  quizStarted,
  totalQuestions,
  score,
  completionTime,
  categoryBreakdown,
  settings,
  history,
  hintsUsed,
  currentView,
  timeRemaining,
  timerActive,
  timePercentage,
  formattedTime,
  isWarning,
  isCritical
} = storeToRefs(store)

// Extract actions from store
const {
  setAnswer,
  useHint,
  nextQuestion,
  previousQuestion,
  startQuiz,
  completeQuiz,
  resetQuiz,
  updateSettings,
  clearHistory,
  exportHistory,
  setView,
  isAnswered,
  pauseTimer,
  resumeTimer
} = store

// Event handlers
const handleAnswerSelected = (answerIndex: number): void => {
  setAnswer(currentQuestionIndex.value, answerIndex)
}

const handleUseHint = (): void => {
  if (currentQuestion.value) {
    useHint(currentQuestion.value.id)
  }
}

const handleSettingsSaved = (): void => {
  // Optional: Show success message or navigate back to quiz
  setView('quiz')
}

const handleTimerToggle = (): void => {
  if (timerActive.value) {
    pauseTimer()
  } else {
    resumeTimer()
  }
}
const themeKey = 'quiz-theme'
import { ref, onMounted, watch } from 'vue'
const isDark = ref(false)

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
    localStorage.setItem(themeKey, 'dark')
  } else {
    root.classList.remove('dark')
    localStorage.setItem(themeKey, 'light')
  }
}
function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}
onMounted(() => {
  const saved = localStorage.getItem(themeKey)
  isDark.value = saved === 'dark'
  applyTheme(isDark.value)
})

</script>

<style scoped>
.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 1000;
  background: #222;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
  width: auto;
  height: auto;
}
.theme-toggle {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 2rem;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 10;
}
.theme-toggle:focus {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.theme-toggle:hover {
  background: var(--btn-bg-hover);
}

:root {
  --bg: #f7f8fa;
  --text: #222;
  --card: #fff;
  --accent: #667eea;
  --accent2: #764ba2;
  --btn-bg: #e0e0e0;
  --btn-bg-hover: #d1d1d1;
  --btn-text: #222;
}
.dark {
  --bg: #181926;
  --text: #f3f3f3;
  --card: #23243a;
  --accent: #a18cd1;
  --accent2: #fbc2eb;
  --btn-bg: #23243a;
  --btn-bg-hover: #32334a;
  --btn-text: #f3f3f3;
}

/* Improve contrast for nav and header */
.app-header, .header-content, .app-nav, .start-card, .quiz-info, .timer-container, .history-view, .analytics-view {
  background: var(--card);
  color: var(--text);
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

.app-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.app-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.timer-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.quiz-start {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.start-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.start-card h2 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.start-card p {
  color: #4a5568;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.quiz-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
}

.info-item {
  text-align: center;
}

.info-label {
  display: block;
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  display: block;
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 700;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  min-width: 150px;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.quiz-active,
.quiz-results {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.settings-view,
.history-view {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    text-align: center;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .start-card {
    padding: 2rem;
  }
  
  .quiz-info {
    grid-template-columns: 1fr;
  }
}
</style>
