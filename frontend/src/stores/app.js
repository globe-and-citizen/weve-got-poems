import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const token = ref('')

  function setToken(newToken) {
    token.value = newToken
  }

  return { token, setToken }
})