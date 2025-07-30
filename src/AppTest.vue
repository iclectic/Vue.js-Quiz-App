<template>
  <div id="app">
    <h1>Simple Store Test</h1>
    <p>Current View: {{ currentView }}</p>
    <p>Quiz Started: {{ quizStarted }}</p>
    <p>Quiz Completed: {{ quizCompleted }}</p>
    <p>Total Questions: {{ totalQuestions }}</p>
    <p v-if="currentQuestion">
      Current Question: {{ currentQuestion.question }}
    </p>
    <button @click="setView('quiz')">
      Set View: Quiz
    </button>
    <button @click="setView('settings')">
      Set View: Settings
    </button>
    <button @click="setView('history')">
      Set View: History
    </button>
    <button @click="startQuiz">
      Start Quiz
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSimpleQuizStore } from './stores/simpleQuizStore'

const store = useSimpleQuizStore()
const { currentView, quizStarted, quizCompleted, totalQuestions, currentQuestion } = storeToRefs(store)
const { setView, startQuiz } = store

</script>

<style scoped>
#app {
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style>
