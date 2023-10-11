import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import jwt_decode from 'jwt-decode'

export const useAppStore = defineStore('app', () => {
    const token = ref('')
    const tokenExpiration = ref(0)

    function setToken(newToken: string) {
        tokenExpiration.value = Date.now() + 1000 * 60 * 60
        token.value = newToken
    }

    const setUser = (user: any) => {
        user.value = user
    }


    const getToken = computed(() => tokenExpiration.value > Date.now() ? token.value : '')
    const getUser= computed(() => jwt_decode(getToken.value) as any)

    return { token, tokenExpiration, setToken, getToken, getUser, setUser }
}, { persist: true })