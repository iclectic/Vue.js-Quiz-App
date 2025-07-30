import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QuizQuestion } from '../types/quiz'

export const useSimpleQuizStore = defineStore('simpleQuiz', () => {
  // Basic state
  const currentView = ref<'quiz' | 'settings' | 'history'>('quiz')
  const quizStarted = ref(false)
  const quizCompleted = ref(false)
  const currentQuestionIndex = ref(0)
  
  // Sample questions
  const questions = ref<QuizQuestion[]>([
    {
      id: 1,
      question: 'What is a hash table?',
      answer: 1,
      options: [
        'A linear data structure',
        'A key-value data structure',
        'A tree structure',
        'A graph structure'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Easy'
    },
    {
      id: 2,
      question: 'What is the time complexity of binary search?',
      answer: 2,
      options: [
        'O(n)',
        'O(n log n)',
        'O(log n)',
        'O(1)'
      ],
      selected: null,
      category: 'Algorithms',
      difficulty: 'Medium'
    }
  ])
  
  // Computed properties
  const totalQuestions = computed(() => questions.value.length)
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  
  // Actions
  const setView = (view: 'quiz' | 'settings' | 'history') => {
    currentView.value = view
  }
  
  const startQuiz = () => {
    quizStarted.value = true
    quizCompleted.value = false
    currentQuestionIndex.value = 0
  }
  
  return {
    // State
    currentView,
    quizStarted,
    quizCompleted,
    currentQuestionIndex,
    questions,
    
    // Computed
    totalQuestions,
    currentQuestion,
    
    // Actions
    setView,
    startQuiz
  }
})
