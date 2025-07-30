<template>
  <div class="quiz-settings">
    <div class="settings-header">
      <h2>Quiz Settings</h2>
      <p>Customise your quiz experience</p>
    </div>

    <div class="settings-grid">
      <div class="setting-group">
        <label class="setting-label">
          <span class="label-text">Time Limit</span>
          <select
            v-model="localSettings.timeLimit"
            class="setting-select"
          >
            <option :value="180">3 minutes</option>
            <option :value="300">5 minutes</option>
            <option :value="600">10 minutes</option>
            <option :value="900">15 minutes</option>
            <option :value="0">No limit</option>
          </select>
        </label>
      </div>

      <div class="form-group">
        <label for="difficulty">Difficulty</label>
        <select
          id="difficulty"
          v-model="localSettings.difficulty"
          aria-label="Select quiz difficulty"
        >
          <option value="All">
            All Levels
          </option>
          <option value="Easy">
            Easy
          </option>
          <option value="Medium">
            Medium
          </option>
          <option value="Hard">
            Hard
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="category">Category</label>
        <select
          id="category"
          v-model="localSettings.category"
          aria-label="Select quiz category"
        >
          <option value="All">
            All Categories
          </option>
          <option value="Data Structures">
            Data Structures
          </option>
          <option value="Algorithms">
            Algorithms
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="shuffle-questions">Shuffle Questions
          <input 
            id="shuffle-questions"
            v-model="localSettings.shuffleQuestions" 
            type="checkbox"
            aria-label="Shuffle questions"
          >
        </label>
      </div>

      <div class="form-group">
        <label for="show-hints">Enable Hints</label>
        <input 
          id="show-hints"
          v-model="localSettings.showHints" 
          type="checkbox"
          aria-label="Enable hints"
        >
      </div>
    </div>

    <div class="settings-actions">
      <button
        class="btn btn-secondary"
        @click="resetToDefaults"
      >
        Reset to Defaults
      </button>
      <button
        class="btn btn-primary"
        @click="saveSettings"
      >
        Save Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { QuizSettings } from '../types/quiz'

interface Props {
  settings: QuizSettings
}

interface Emits {
  (e: 'update:settings', settings: QuizSettings): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localSettings = ref<QuizSettings>({ ...props.settings })

const defaultSettings: QuizSettings = {
  timeLimit: 300,
  showTimer: true,
  shuffleQuestions: true,
  showHints: false,
  difficulty: 'All',
  category: 'All'
}

const resetToDefaults = (): void => {
  localSettings.value = { ...defaultSettings }
  emit('update:settings', localSettings.value)
}

const saveSettings = (): void => {
  emit('update:settings', localSettings.value)
  emit('save')
}

// Watch for changes and emit updates
watch(localSettings, (newSettings) => {
  emit('update:settings', newSettings)
}, { deep: true })
</script>

<style scoped>
.quiz-settings {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.settings-header p {
  color: #6b7280;
  font-size: 1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.label-text {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.setting-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
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

@media (max-width: 640px) {
  .quiz-settings {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
