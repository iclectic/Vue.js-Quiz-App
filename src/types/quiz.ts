export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  answer: number
  selected: number | null
  category: 'Data Structures' | 'Algorithms'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  index?: number
}

export interface CategoryStats {
  correct: number
  total: number
}

export interface CategoryBreakdown {
  [category: string]: CategoryStats
}

export interface QuizState {
  questions: QuizQuestion[]
  currentQuestion: number
  quizCompleted: boolean
  startTime: number | null
  endTime: number | null
}

export interface QuizStore extends QuizState {
  // Getters
  score: number
  getCurrentQuestion: QuizQuestion
  totalQuestions: number
  progress: number
  scorePercentage: number
  completionTime: number | null
  categoryBreakdown: CategoryBreakdown
  
  // Actions
  setAnswer: (questionIndex: number, answerIndex: number) => void
  nextQuestion: () => void
  resetQuiz: () => void
  startQuiz: () => void
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard'
export type QuizCategory = 'Data Structures' | 'Algorithms'

export interface QuizSettings {
  timeLimit: number // in seconds
  showTimer: boolean
  shuffleQuestions: boolean
  showHints: boolean
  difficulty: DifficultyLevel | 'All'
  category: QuizCategory | 'All'
}

export interface QuizResult {
  id: string
  date: string
  score: number
  totalQuestions: number
  completionTime: number
  scorePercentage: number
  categoryBreakdown: CategoryBreakdown
  settings: QuizSettings
}

export interface QuizHistory {
  results: QuizResult[]
  bestScore: number
  averageScore: number
  totalQuizzes: number
}

export interface QuizHint {
  text: string
  penalty: number // points deducted for using hint
}
