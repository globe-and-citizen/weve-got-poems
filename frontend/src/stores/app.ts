import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

export const useAppStore = defineStore(
  'app',
  () => {
    const token = ref('');
    const tokenExpiration = ref(0);

    function setToken(newToken: string) {
      tokenExpiration.value = Date.now() + 1000 * 60 * 60;
      token.value = newToken;
    }

    const setUser = (user: any) => {
      user.value = user;
    };

    const getToken = computed(() =>
      tokenExpiration.value > Date.now() ? token.value : ''
    );
    const getUser = computed(() =>
      getToken.value ? (jwtDecode(getToken.value) as any) : undefined
    );

    return { token, tokenExpiration, setToken, getToken, getUser, setUser };
  },
  { persist: true }
);
