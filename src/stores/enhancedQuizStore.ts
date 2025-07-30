import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { QuizQuestion, CategoryBreakdown, QuizSettings, QuizHistory, QuizResult } from '../types/quiz'
import { useLocalStorage } from '../composables/useLocalStorageSimple'

export const useEnhancedQuizStore = defineStore('enhancedQuiz', () => {
  // Default settings
  const defaultSettings: QuizSettings = {
    timeLimit: 300, // 5 minutes
    showTimer: true,
    shuffleQuestions: true,
    showHints: false,
    difficulty: 'All',
    category: 'All'
  }

  // Persistent state using localStorage
  const settings = useLocalStorage('quiz-settings', defaultSettings)
  const history = useLocalStorage<QuizHistory>('quiz-history', {
    results: [],
    bestScore: 0,
    averageScore: 0,
    totalQuizzes: 0
  })

  // Quiz state
  const questions = ref<QuizQuestion[]>([
    {
      id: 1,
      question: 'Suppose you\'ve got a list of numbers and you want to find out if a particular number is in there. Which data structure would probably let you check the fastest, on average?',
      answer: 1,
      options: [
        'Array (scanning from start to finish)',
        'Hash table',
        'Linked list',
        'Stack'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Easy'
    },
    {
      id: 2,
      question: 'If you\'re always adding new items to the front and removing them from the back, which data structure is likely to cause you the least hassle?',
      answer: 2,
      options: [
        'Stack',
        'Binary search tree',
        'Queue',
        'Heap'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Easy'
    },
    {
      id: 3,
      question: 'Which sorting algorithm, out of the following, is generally considered the worst for big lists if you care about speed?',
      answer: 3,
      options: [
        'Merge sort',
        'Quick sort',
        'Heap sort',
        'Bubble sort'
      ],
      selected: null,
      category: 'Algorithms',
      difficulty: 'Medium'
    },
    {
      id: 4,
      question: 'What\'s the time complexity of searching for an element in a balanced binary search tree?',
      answer: 1,
      options: [
        'O(n)',
        'O(log n)',
        'O(1)',
        'O(n²)'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Medium'
    },
    {
      id: 5,
      question: 'In a graph, what does DFS stand for?',
      answer: 0,
      options: [
        'Depth-First Search',
        'Direct File System',
        'Dynamic Function Search',
        'Data Flow Structure'
      ],
      selected: null,
      category: 'Algorithms',
      difficulty: 'Easy'
    }
  ])

  const currentQuestionIndex = ref(0)
  const selectedAnswers = ref<{ [key: number]: string }>({})
  const quizCompleted = ref(false)
  const quizStarted = ref(false)
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)
  const hintsUsed = ref<{ [key: number]: boolean }>({})
  const currentView = ref<'quiz' | 'settings' | 'history'>('quiz')

  // Timer state
  const timeRemaining = ref(settings.value.timeLimit)
  const timerActive = ref(false)
  const timerId = ref<number | null>(null)

  // Computed properties
  const filteredQuestions = computed(() => {
    let filtered = [...questions.value]
    
    if (settings.value.difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === settings.value.difficulty)
    }
    
    if (settings.value.category !== 'All') {
      filtered = filtered.filter(q => q.category === settings.value.category)
    }
    
    if (settings.value.shuffleQuestions) {
      filtered = filtered.sort(() => Math.random() - 0.5)
    }
    
    return filtered
  })

  const currentQuestion = computed(() => {
    return filteredQuestions.value[currentQuestionIndex.value] || null
  })

  const totalQuestions = computed(() => filteredQuestions.value.length)

  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100)
  })

  const score = computed(() => {
    return filteredQuestions.value.reduce((total, question) => {
      const userAnswer = selectedAnswers.value[question.id]
      if (userAnswer !== undefined) {
        const isCorrect = parseInt(userAnswer) === question.answer
        const hintPenalty = hintsUsed.value[question.id] ? 0.5 : 0
        return total + (isCorrect ? 1 - hintPenalty : 0)
      }
      return total
    }, 0)
  })

  const scorePercentage = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((score.value / totalQuestions.value) * 100)
  })

  const completionTime = computed<number | null>(() => {
    if (!startTime.value || !endTime.value) return null
    return Math.round((endTime.value - startTime.value) / 1000)
  })

  const timePercentage = computed(() => {
    if (settings.value.timeLimit === 0) return 100
    return (timeRemaining.value / settings.value.timeLimit) * 100
  })

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  const isWarning = computed(() => timeRemaining.value <= 60)
  const isCritical = computed(() => timeRemaining.value <= 30)

  const categoryBreakdown = computed<CategoryBreakdown>(() => {
    const breakdown: CategoryBreakdown = {}
    
    filteredQuestions.value.forEach(question => {
      const category = question.category
      if (!breakdown[category]) {
        breakdown[category] = { correct: 0, total: 0 }
      }
      breakdown[category].total++
      
      const userAnswer = selectedAnswers.value[question.id]
      if (userAnswer !== undefined && parseInt(userAnswer) === question.answer) {
        breakdown[category].correct++
      }
    })
    
    return breakdown
  })

  // Timer functions
  const startTimer = (): void => {
    if (settings.value.timeLimit === 0 || timerActive.value) return
    
    timerActive.value = true
    timerId.value = window.setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        completeQuiz()
      }
    }, 1000)
  }

  const stopTimer = (): void => {
    timerActive.value = false
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }

  const pauseTimer = (): void => {
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
    }
    timerActive.value = false
  }

  const resumeTimer = (): void => {
    if (!timerActive.value && timeRemaining.value > 0) {
      startTimer()
    }
  }

  const resetTimer = (): void => {
    stopTimer()
    timeRemaining.value = settings.value.timeLimit
  }

  // Actions
  const setAnswer = (questionIndex: number, answerIndex: number): void => {
    const question = filteredQuestions.value[questionIndex]
    if (question) {
      selectedAnswers.value[question.id] = answerIndex.toString()
    }
  }

  const useHint = (questionId: number): void => {
    if (settings.value.showHints) {
      hintsUsed.value[questionId] = true
    }
  }

  const nextQuestion = (): void => {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
    } else {
      completeQuiz()
    }
  }

  const previousQuestion = (): void => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
    }
  }

  const startQuiz = (): void => {
    quizStarted.value = true
    quizCompleted.value = false
    startTime.value = Date.now()
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    hintsUsed.value = {}
    
    if (settings.value.showTimer) {
      resetTimer()
      startTimer()
    }
  }

  const completeQuiz = (): void => {
    if (quizCompleted.value) return
    
    quizCompleted.value = true
    endTime.value = Date.now()
    stopTimer()
    
    // Save result to history
    saveQuizResult()
  }

  const resetQuiz = (): void => {
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    hintsUsed.value = {}
    quizCompleted.value = false
    quizStarted.value = false
    startTime.value = null
    endTime.value = null
    stopTimer()
    resetTimer()
  }

  const saveQuizResult = (): void => {
    if (!completionTime.value) return

    const result: QuizResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: score.value,
      totalQuestions: totalQuestions.value,
      completionTime: completionTime.value,
      scorePercentage: scorePercentage.value,
      categoryBreakdown: categoryBreakdown.value,
      settings: { ...settings.value }
    }

    const newHistory = { ...history.value }
    newHistory.results.push(result)
    newHistory.totalQuizzes = newHistory.results.length
    newHistory.bestScore = Math.max(newHistory.bestScore, scorePercentage.value)
    newHistory.averageScore = newHistory.results.reduce((sum, r) => sum + r.scorePercentage, 0) / newHistory.results.length

    history.value = newHistory
  }

  const updateSettings = (newSettings: QuizSettings): void => {
    settings.value = newSettings
    resetTimer()
  }

  const clearHistory = (): void => {
    history.value = {
      results: [],
      bestScore: 0,
      averageScore: 0,
      totalQuizzes: 0
    }
  }

  const exportHistory = (): void => {
    const dataStr = JSON.stringify(history.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quiz-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const setView = (view: 'quiz' | 'settings' | 'history'): void => {
    currentView.value = view
  }

  const isAnswered = (questionIndex: number): boolean => {
    const question = filteredQuestions.value[questionIndex]
    return question ? selectedAnswers.value[question.id] !== undefined : false
  }

  // Watch for settings changes to update timer
  watch(() => settings.value.timeLimit, (newTimeLimit) => {
    if (!quizStarted.value) {
      timeRemaining.value = newTimeLimit
    }
  })

  return {
    // State
    questions: filteredQuestions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswers,
    quizCompleted,
    quizStarted,
    totalQuestions,
    progress,
    score,
    scorePercentage,
    completionTime,
    categoryBreakdown,
    settings,
    history,
    hintsUsed,
    currentView,
    
    // Timer state
    timeRemaining,
    timerActive,
    timePercentage,
    formattedTime,
    isWarning,
    isCritical,
    
    // Actions
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
    
    // Timer actions
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer
  }
})
