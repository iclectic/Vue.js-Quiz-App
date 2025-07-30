import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTestStore = defineStore('test', () => {
  const message = ref('Hello from test store!')
  const count = ref(0)
  
  const increment = () => {
    count.value++
  }
  
  return {
    message,
    count,
    increment
  }
})
