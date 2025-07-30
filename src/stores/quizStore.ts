import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QuizQuestion, CategoryBreakdown, QuizCategory, DifficultyLevel } from '../types/quiz'

export const useQuizStore = defineStore('quiz', () => {
  // State
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
      question: 'You might\'ve heard people moan about recursion. What\'s one real risk if you use recursion too freely in your code?',
      answer: 0,
      options: [
        'You could hit a stack overflow',
        'It always makes your code slower',
        'It\'s impossible to debug',
        'It can\'t be used with arrays'
      ],
      selected: null,
      category: 'Algorithms',
      difficulty: 'Medium'
    },
    {
      id: 5,
      question: 'If you\'re building a system where you need to keep track of the "largest" item at all times, which data structure makes that a breeze?',
      answer: 1,
      options: [
        'Linked list',
        'Heap',
        'Queue',
        'Hash table'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Medium'
    },
    {
      id: 6,
      question: 'What\'s the main reason you might pick a binary search tree over a plain old array for storing sorted data?',
      answer: 2,
      options: [
        'Arrays use less memory',
        'Binary search trees are easier to implement',
        'Faster insertions and deletions',
        'Arrays are always faster for searching'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Medium'
    },
    {
      id: 7,
      question: 'Say you need to keep track of the order in which things happen (like browser history). Which structure is probably your best mate?',
      answer: 0,
      options: [
        'Stack',
        'Queue',
        'Heap',
        'Graph'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Easy'
    },
    {
      id: 8,
      question: 'Which one of these is not a linear data structure?',
      answer: 3,
      options: [
        'Array',
        'Queue',
        'Stack',
        'Tree'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Easy'
    },
    {
      id: 9,
      question: 'If you want to visit every node in a tree, but you want to finish all of one level before moving on to the next, what\'s the name of that approach?',
      answer: 1,
      options: [
        'Depth-first search',
        'Breadth-first search',
        'Binary search',
        'Hashing'
      ],
      selected: null,
      category: 'Algorithms',
      difficulty: 'Medium'
    },
    {
      id: 10,
      question: 'Which data structure would you probably use to model a network of friends on a social media site?',
      answer: 2,
      options: [
        'Stack',
        'Queue',
        'Graph',
        'Heap'
      ],
      selected: null,
      category: 'Data Structures',
      difficulty: 'Hard'
    }
  ])

  const currentQuestion = ref<number>(0)
  const quizCompleted = ref<boolean>(false)
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)

  // Getters (computed properties)
  const score = computed<number>(() => {
    return questions.value.reduce((total, question) => {
      return question.selected === question.answer ? total + 1 : total
    }, 0)
  })

  const getCurrentQuestion = computed<QuizQuestion>(() => {
    const question = questions.value[currentQuestion.value]
    return question ? { ...question, index: currentQuestion.value } : questions.value[0]
  })

  const totalQuestions = computed<number>(() => questions.value.length)

  const progress = computed<number>(() => {
    return Math.round((currentQuestion.value / totalQuestions.value) * 100)
  })

  const scorePercentage = computed<number>(() => {
    return Math.round((score.value / totalQuestions.value) * 100)
  })

  const completionTime = computed<number | null>(() => {
    if (!startTime.value || !endTime.value) return null
    return Math.round((endTime.value - startTime.value) / 1000) // in seconds
  })

  const categoryBreakdown = computed<CategoryBreakdown>(() => {
    const breakdown: CategoryBreakdown = {}
    questions.value.forEach(q => {
      if (!breakdown[q.category]) {
        breakdown[q.category] = { total: 0, correct: 0 }
      }
      breakdown[q.category].total++
      if (q.selected === q.answer) {
        breakdown[q.category].correct++
      }
    })
    return breakdown
  })

  // Actions
  const setAnswer = (questionIndex: number, answerIndex: number): void => {
    if (questionIndex >= 0 && questionIndex < questions.value.length) {
      questions.value[questionIndex].selected = parseInt(answerIndex.toString())
    }
  }

  const nextQuestion = (): void => {
    if (currentQuestion.value < questions.value.length - 1) {
      currentQuestion.value++
    } else {
      quizCompleted.value = true
      endTime.value = Date.now()
    }
  }

  const resetQuiz = (): void => {
    currentQuestion.value = 0
    quizCompleted.value = false
    startTime.value = null
    endTime.value = null
    questions.value.forEach(q => {
      q.selected = null
    })
  }

  const startQuiz = (): void => {
    startTime.value = Date.now()
  }

  const isAnswered = (questionIndex: number): boolean => {
    return questions.value[questionIndex]?.selected !== null
  }

  const getQuestionsByCategory = (category: QuizCategory): QuizQuestion[] => {
    return questions.value.filter(q => q.category === category)
  }

  const getQuestionsByDifficulty = (difficulty: DifficultyLevel): QuizQuestion[] => {
    return questions.value.filter(q => q.difficulty === difficulty)
  }

  return {
    // State
    questions,
    currentQuestion,
    quizCompleted,
    startTime,
    endTime,
    
    // Getters
    score,
    getCurrentQuestion,
    totalQuestions,
    progress,
    scorePercentage,
    completionTime,
    categoryBreakdown,
    
    // Actions
    setAnswer,
    nextQuestion,
    resetQuiz,
    startQuiz,
    isAnswered,
    getQuestionsByCategory,
    getQuestionsByDifficulty
  }
})
