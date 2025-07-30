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

  // Adaptive and timing state
  const answerStreak = ref(0) // + for correct, - for incorrect
  const currentDifficulty = ref<'Easy' | 'Medium' | 'Hard'>('Easy')
  const difficultyProgression = ref<string[]>([])
  const answerHistory = ref<import('../types/quiz').AnswerHistoryItem[]>([])
  const questionStartTime = ref<number | null>(null)

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

  // Actions
  const setAnswer = (questionIndex: number, answerIndex: number): void => {
    const question = filteredQuestions.value[questionIndex]
    if (!question || quizCompleted.value) return

    // Record time spent on this question
    const now = Date.now()
    let timeSpent = 0
    if (questionStartTime.value) {
      timeSpent = Math.round((now - questionStartTime.value) / 1000)
      questionStartTime.value = now
    }

    selectedAnswers.value[question.id] = answerIndex.toString()

    // Check correctness
    const isCorrect = answerIndex === question.answer
    // Update streak
    if (isCorrect) {
      answerStreak.value = answerStreak.value >= 0 ? answerStreak.value + 1 : 1
    } else {
      answerStreak.value = answerStreak.value <= 0 ? answerStreak.value - 1 : -1
    }

    // Save to answer history
    answerHistory.value.push({
      questionId: question.id,
      selected: answerIndex,
      correct: isCorrect,
      difficulty: question.difficulty,
      timeSpent
    })
    // Save difficulty progression
    difficultyProgression.value.push(currentDifficulty.value)

    // Move to next question or complete quiz
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      nextQuestion()
    } else {
      completeQuiz()
    }
  }

  const nextQuestion = (): void => {
    // Adaptive logic: adjust difficulty based on streak
    let nextDifficulty = currentDifficulty.value
    if (answerStreak.value >= 2 && currentDifficulty.value !== 'Hard') {
      nextDifficulty = currentDifficulty.value === 'Easy' ? 'Medium' : 'Hard'
    } else if (answerStreak.value <= -2 && currentDifficulty.value !== 'Easy') {
      nextDifficulty = currentDifficulty.value === 'Hard' ? 'Medium' : 'Easy'
    }
    currentDifficulty.value = nextDifficulty

    // Find next unanswered question of the desired difficulty
    const unanswered = filteredQuestions.value.filter((q, i) =>
      !selectedAnswers.value[q.id] && q.difficulty === nextDifficulty
    )
    if (unanswered.length > 0) {
      const nextQ = unanswered[0]
      const idx = filteredQuestions.value.findIndex(q => q.id === nextQ.id)
      if (idx !== -1) {
        currentQuestionIndex.value = idx
      } else {
        currentQuestionIndex.value++
      }
    } else {
      // Fallback: next unanswered question of any difficulty
      const anyUnanswered = filteredQuestions.value.findIndex((q, i) => !selectedAnswers.value[q.id])
      if (anyUnanswered !== -1) {
        currentQuestionIndex.value = anyUnanswered
      } else if (currentQuestionIndex.value < totalQuestions.value - 1) {
        currentQuestionIndex.value++
      }
    }
    questionStartTime.value = Date.now()
  }

  const startQuiz = (): void => {
    quizStarted.value = true
    quizCompleted.value = false
    startTime.value = Date.now()
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    hintsUsed.value = {}
    answerStreak.value = 0
    currentDifficulty.value = settings.value.difficulty === 'All' ? 'Easy' : settings.value.difficulty as 'Easy' | 'Medium' | 'Hard'
    difficultyProgression.value = []
    answerHistory.value = []
    questionStartTime.value = Date.now()

    if (settings.value.showTimer) {
      resetTimer()
      startTimer()
    }
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
      settings: { ...settings.value },
      answerHistory: [...answerHistory.value],
      difficultyProgression: [...difficultyProgression.value]
    }

    history.value.results.unshift(result)
    if (history.value.results.length > 50) {
      history.value.results.pop()

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
    /**
     * Mark the current question as having used a hint (for analytics and scoring).
     * Accessible for keyboard users and screen readers.
     */
    useHint: (questionIndex: number) => {
      hintsUsed.value[filteredQuestions.value[questionIndex]?.id] = true;
    },
    /**
     * Move to the previous question (if not at the start).
     * Maintains accessibility focus and adaptive logic.
     */
    previousQuestion: () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
        questionStartTime.value = Date.now();
      }
    },
    /**
     * Completes the quiz, records end time, saves results, and stops the timer.
     * Ensures accessibility focus for results region.
     */
    completeQuiz: () => {
      quizCompleted.value = true;
      quizStarted.value = false;
      endTime.value = Date.now();
      stopTimer();
      saveQuizResult();
    },
    /**
     * Resets the quiz state for a new attempt. All progress is cleared.
     */
    resetQuiz: () => {
      quizStarted.value = false;
      quizCompleted.value = false;
      startTime.value = null;
      endTime.value = null;
      currentQuestionIndex.value = 0;
      selectedAnswers.value = {};
      hintsUsed.value = {};
      answerStreak.value = 0;
      currentDifficulty.value = settings.value.difficulty === 'All' ? 'Easy' : settings.value.difficulty as 'Easy' | 'Medium' | 'Hard';
      difficultyProgression.value = [];
      answerHistory.value = [];
      timeRemaining.value = settings.value.timeLimit;
      stopTimer();
    },
    /**
     * Update quiz settings and reset timer if necessary.
     * Emits changes for accessibility and persistence.
     */
    updateSettings: (newSettings: QuizSettings) => {
      settings.value = { ...settings.value, ...newSettings };
      timeRemaining.value = settings.value.timeLimit;
    },
    useHint,
    previousQuestion,
    completeQuiz,
    resetQuiz,
    updateSettings,
    nextQuestion,
    startQuiz,
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
}
export default useEnhancedQuizStore;
