import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const token = ref('')
  const tokenExpiration = ref(0)

  // TODO: Remove default value
  const user = ref(
    {
      'id': 7,
      'name': 'tester account',
      'email': 'test@doe.com',
      'created_at': '2023-09-26T11:13:15.861Z'
    })

  function setToken(newToken: string) {
    tokenExpiration.value = Date.now() + 1000 * 60 * 60
    token.value = newToken
  }

  const setUser = (user: any) => {
    user.value = user
  }


  const getToken = computed(() => tokenExpiration.value > Date.now() ? token.value : '')
  const getUser = computed(() => user.value)

  return { token, tokenExpiration, setToken, getToken, getUser, setUser }
}, { persist: true })