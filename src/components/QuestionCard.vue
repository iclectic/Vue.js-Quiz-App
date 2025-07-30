<template>
  <div class="question-card">
    <!-- Question Meta Information -->
    <div class="question-meta">
      <span class="category">{{ question.category }}</span>
      <span
        class="difficulty"
        :class="question.difficulty.toLowerCase()"
      >
        {{ question.difficulty }}
      </span>
    </div>
    
    <!-- Question Text -->
    <h2 class="question-text">
      {{ question.question }}
    </h2>
    
    <!-- Score Display -->
    <div class="score-display">
      Current Score: {{ currentScore }}/{{ totalQuestions }}
    </div>
    
    <!-- Answer Options -->
    <div class="options">
      <label 
        v-for="(option, index) in question.options"
        :key="index"
        :class="getOptionClass(index)"
        class="option"
      >
        <input
          type="radio"
          :name="`question-${question.index}`"
          :value="index"
          :checked="question.selected === index"
          :disabled="question.selected !== null"
          @change="handleAnswerSelect(index)"
        >
        <span class="option-text">{{ option }}</span>
      </label>
    </div>
    
    <!-- Navigation Button -->
    <button
      :disabled="question.selected === null"
      class="next-button"
      @click="handleNext"
    >
      {{ getButtonText() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { QuizQuestion } from '../types/quiz'

interface Props {
  question: QuizQuestion
  currentScore: number
  totalQuestions: number
  isLastQuestion?: boolean
}

interface Emits {
  (e: 'answer-selected', answerIndex: number): void
  (e: 'next-question'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLastQuestion: false
})

const emit = defineEmits<Emits>()

const handleAnswerSelect = (answerIndex: number): void => {
  emit('answer-selected', answerIndex)
}

const handleNext = (): void => {
  emit('next-question')
}

const getOptionClass = (index: number): string => {
  const baseClass = 'option'
  
  if (props.question.selected === null) {
    return baseClass
  }
  
  const isSelected = props.question.selected === index
  const isCorrect = index === props.question.answer
  const isSelectedCorrect = props.question.selected === props.question.answer
  
  if (isSelected) {
    return `${baseClass} ${isSelectedCorrect ? 'correct' : 'wrong'}`
  }
  
  if (isCorrect && !isSelectedCorrect) {
    return `${baseClass} correct-answer`
  }
  
  return `${baseClass} disabled`
}

const getButtonText = () => {
  if (props.question.selected === null) {
    return 'Select an option'
  }
  return props.isLastQuestion ? 'Finish Quiz' : 'Next Question'
}
</script>

<style scoped>
.question-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.question-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.category {
  background-color: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty.easy {
  background-color: #10B981;
  color: white;
}

.difficulty.medium {
  background-color: #F59E0B;
  color: white;
}

.difficulty.hard {
  background-color: #EF4444;
  color: white;
}

.question-text {
  font-size: 1.4rem;
  line-height: 1.6;
  margin: 1.5rem 0;
  color: #fff;
  text-align: center;
  font-weight: 500;
}

.score-display {
  text-align: center;
  margin-bottom: 2rem;
  color: #8f8f8f;
  font-size: 1rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.option {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #3a2f47;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.option:hover:not(.disabled) {
  background-color: #4a3f57;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.option.correct {
  background-color: #10B981;
  border-color: #059669;
  color: white;
}

.option.wrong {
  background-color: #EF4444;
  border-color: #DC2626;
  color: white;
}

.option.correct-answer {
  background-color: #10B981;
  border-color: #059669;
  color: white;
  animation: pulse 1s ease-in-out;
}

.option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option input[type="radio"] {
  margin-right: 1rem;
  transform: scale(1.2);
}

.option-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.4;
}

.next-button {
  width: 100%;
  padding: 1rem 2rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.next-button:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@media (max-width: 768px) {
  .question-card {
    padding: 1.5rem;
  }
  
  .question-text {
    font-size: 1.2rem;
  }
  
  .question-meta {
    flex-direction: column;
    align-items: center;
  }
}
</style>
