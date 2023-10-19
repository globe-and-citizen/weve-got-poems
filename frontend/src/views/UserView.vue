<template>
  <div class='flex  flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
    <div>
      <ac-notification v-if='notification' :variant='notification.status'>
        {{ notification.message }}
      </ac-notification>
    </div>
    <div class='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
      <form class='space-y-6' @submit.prevent='submitLogin'>
        <div>
          <label class='block text-sm font-medium leading-6 text-gray-900' for='email'>Email address</label>
          <div class='mt-2'>
            <input id='email' v-model='loginEmail' autocomplete='email'
                   class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                   name='email' required
                   type='email'/>
          </div>
        </div>

        <div>
          <label class='block text-sm font-medium leading-6 text-gray-900' for='name'>Displayed Name</label>
          <div class='mt-2'>
            <input id='name' autocomplete='email'
                   class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                   name='name' required
                   type='email'/>
          </div>
        </div>

        <div>
          <div class='flex items-center justify-between'>
            <label class='block text-sm font-medium leading-6 text-gray-900' for='password'>Password</label>
          </div>
          <div class='mt-2'>
            <input id='password' v-model='loginPassword' autocomplete='current-password'
                   class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                   name='password'
                   required
                   type='password'/>
          </div>
        </div>

        <div>
          <button
              class='flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
              data-test='login-button'
              type='submit'>
            Save
          </button>
        </div>
      </form>
    </div>


  </div>
</template>

<style lang='scss'>
* {
  //border: solid red 1px;
}

@media (min-width: 1024px) {
  .about {
  }
}
</style>

<script setup lang='ts'>

import {ref} from 'vue'
import {useAppStore} from '@/stores/app'
import {useRouter} from 'vue-router'
import AcNotification from '@/components/ac-notification.vue'
import {useWallet} from '@/composables/useWallet'


const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT


const status = ref(true)

const registerEmail = ref('')
const registerName = ref('')
const registerPassword = ref('')

const loginEmail = ref('')
const loginPassword = ref('')

const loginError = ref()
const loginData = ref()
const loginStatus = ref()
const loginLoading = ref()
const loginLoaded = ref(false)

const registerError = ref()
const registerData = ref()
const registerStatus = ref()
const notification = ref()

const router = useRouter()

const appStore = useAppStore()
const wallet = useWallet()
const onSignIn = () => {
  wallet.signInWithEthereum()
}
const setStatus = (value: boolean) => {
  status.value = value
}

const submitLogin = async () => {

  // Handle fetch in a try catch
  try {
    loginLoading.value = true
    const response = await fetch(endpoint + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    })
    if (response.ok) {
      // Successful response
      loginData.value = await response.json()
      if (loginData.value.token) {
        appStore.setToken(loginData.value.token)
      }
      // Notification message
      notification.value = {
        message: 'Welcome to our platform! ',
        status: 'success'
      }
      // Redirection
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else if (response.status >= 400 && response.status < 500) {
      // Client error
      notification.value = {
        message: `Unable to login the user  : Client Error: ${response.status} - ${response.statusText}`,
        status: 'error'
      }
    } else {
      // Server error
      notification.value = {
        message: `Unable to login the user  : Server Error: ${response.status} - ${response.statusText}`,
        status: 'error'
      }
    }
  } catch (error: any) {
    // Network error or other unexpected errors
    notification.value = {
      message: `Unable to login the user  : Unexpected Error: ${error.message}`,
      status: 'error'
    }
    loginError.value = error
  } finally {
    loginLoading.value = false
  }

  // reset inputs values
  loginEmail.value = ''
  loginPassword.value = ''
  loginStatus.value = 'done'
}

const submitRegister = async () => {
  // send data to backend using fetch api
  await fetch(endpoint + '/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerEmail.value,
          name: registerName.value,
          password: registerPassword.value
        })
      }
  ).then(async (response) => {
    registerData.value = await response.json()

    // TODO: register should return 201
    if (response.status === 201) {
      if (registerData.value.token) {
        appStore.setToken(registerData.value.token)
      }
      // Notification message
      notification.value = {
        message: 'Welcome to our platform! ',
        status: 'success'
      }

      // redirect to home page after timeout
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      notification.value = {
        message: 'Unable to Register the user \n Message Error: ' + registerData.value.message,
        status: 'error'
      }
    }
  }).catch((error) => {
    registerData.value = error
    notification.value = {
      message: 'Unable to Register the user \n Message Error: ' + error.message,
      status: 'error'
    }
  })
  // reset inputs values
  registerEmail.value = ''
  registerName.value = ''
  registerPassword.value = ''
}
</script>
