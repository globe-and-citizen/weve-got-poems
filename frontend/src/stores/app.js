import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const token = ref('')
  const tokenExpiration = ref(0)

  function setToken(newToken) {
    tokenExpiration.value = Date.now() + 1000 * 60 * 60
    token.value = newToken
  }

  const getToken = computed(() => tokenExpiration > Date.now() ? token.value : '')

  return { token, setToken, getToken }
}, { persist: true })