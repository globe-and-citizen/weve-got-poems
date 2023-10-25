<template>
  <div class='flex  flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
    <div>
      <ac-notification v-if='notification' :variant='notification.status'>
        {{ notification.message }}
      </ac-notification>
    </div>
    <div class='sm:mx-auto sm:w-full sm:max-w-sm'>
      <h2 class='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>Sign in to your
        account using Ethereum</h2>
    </div>
    <div class='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
      <button
        class='flex w-full justify-center rounded-md bg-blue-400 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
        data-test='register-button'
        @click.prevent='onSignIn()'
      >
        Sign in With Ethereum
      </button>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import AcNotification from '@/components/ac-notification.vue'
import { useWallet } from '@/composables/useWallet'


const notification = ref()

const router = useRouter()

const appStore = useAppStore()
const wallet = useWallet()
const onSignIn = () => {
  wallet.signInWithEthereum().then(token => {
    if (token) {
      appStore.setToken(token)
      router.push('/')
    }
  })
}

if (appStore.getToken) {
  // notify user that he is already logged in
  // timeout before redirection
  setTimeout(() => {
    router.push('/')
  }, 5000)
}

</script>
