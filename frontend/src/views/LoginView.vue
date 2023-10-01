<template>
  <div class='flex  flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
    <div>
      <ac-notification :variant='notification.status' v-if='notification'>
        {{ notification.message }}
      </ac-notification>
    </div>
    <div class='flex justify-center space-x-1 rounded-lg p-0.5 bg-slate-50 m-auto'>
      <button class='flex items-center rounded-md py-2 px-12 text-sm font-semibold' :class='{"bg-white shadow": status}'
              @click='setStatus(true)' data-test='login'>Login
      </button>
      <button
        class='flex items-center rounded-md py-2 px-12 text-sm font-semibold ' :class='{"bg-white shadow": !status}'
        @click='setStatus(false)' data-test='register'>
        Register
      </button>
    </div>
    <div v-if='status'>
      <div class='sm:mx-auto sm:w-full sm:max-w-sm'>
        <h2 class='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>Sign in to your
          account</h2>
      </div>
      <div class='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form class='space-y-6' @submit.prevent='submitLogin'>
          <div>
            <label for='email' class='block text-sm font-medium leading-6 text-gray-900'>Email address</label>
            <div class='mt-2'>
              <input id='email' name='email' type='email' autocomplete='email' required='' v-model='loginEmail'
                     class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6' />
            </div>
          </div>

          <div>
            <div class='flex items-center justify-between'>
              <label for='password' class='block text-sm font-medium leading-6 text-gray-900'>Password</label>
              <div class='text-sm'>
                <a href='#' class='font-semibold text-emerald-600 hover:text-emerald-500'>Forgot password?</a>
              </div>
            </div>
            <div class='mt-2'>
              <input id='password' name='password' type='password' autocomplete='current-password' required=''
                     v-model='loginPassword'
                     class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6' />
            </div>
          </div>

          <div>
            <button type='submit'
                    data-test='login-button'
                    class='flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'>
              Sign in
            </button>
          </div>
        </form>

        <p class='mt-10 text-center text-sm text-gray-500'>
          Not a member?
          {{ ' ' }}
          <a href='#' class='font-semibold leading-6 text-emerald-500 hover:text-emerald-500'>Start a 14 day free
            trial</a>
        </p>
      </div>
    </div>
    <div v-else>
      <div class='sm:mx-auto sm:w-full sm:max-w-sm'>
        <h2 class='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>Register your
          account</h2>
      </div>
      <div class='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form class='space-y-6' @submit.prevent='submitRegister'>
          <div>
            <label for='email' class='block text-sm font-medium leading-6 text-gray-900'>Email address</label>
            <div class='mt-2'>
              <input id='email' name='email' type='email' autocomplete='email' required=''
                     v-model='registerEmail'
                     class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6' />
            </div>
          </div>

          <div>
            <label for='name' class='block text-sm font-medium leading-6 text-gray-900'>Name</label>
            <div class='mt-2'>
              <input id='name' name='name' type='text' autocomplete='name' required='' v-model='registerName'
                     class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6' />
            </div>
          </div>
          <div>
            <div class='flex items-center justify-between'>
              <label for='password' class='block text-sm font-medium leading-6 text-gray-900'>Password</label>
            </div>
            <div class='mt-2'>
              <input id='password' name='password' type='password' autocomplete='current-password' required=''
                     v-model='registerPassword'
                     class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6' />
            </div>
          </div>

          <div>
            <button type='submit'
                    data-test='register-button'
                    class='flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'>
              Register
            </button>
          </div>
        </form>
      </div>
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

<script setup>

import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import AcNotification from '@/components/ac-notification.vue'

const status = ref(true)

const registerEmail = ref('')
const registerName = ref('')
const registerPassword = ref('')

const loginEmail = ref('')
const loginPassword = ref('')

const loginError = ref()
const loginData = ref()
const loginStatus = ref()

const registerError = ref()
const registerData = ref()
const registerStatus = ref()
const notification = ref()

const router = useRouter()

const appStore = useAppStore()
if (appStore.getToken) {
  // notify user that he is already logged in
  // timeout before redirection
  setTimeout(() => {
    router.push('/')
  }, 5000)
}

const setStatus = (value) => {
  status.value = value
}
const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT

const submitLogin = async () => {
  loginStatus.value = 'loading'
  // send data to backend using fetch api
  await fetch(endpoint + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    }
  ).then(async (response) => {
    if (response.status === 200) {
      loginData.value = await response.json()
      if (loginData.value.token) {
        appStore.setToken(loginData.value.token)
      }
      console.log('should notify')
      // setNotification on success
      notification.value = {
        message: 'Welcome to our platform! ',
        status: 'success'
      }

      // redirect to home page after timeout
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      loginError.value = await response.json()
      // create notification on error
      notification.value = {
        message: 'Unable to login the user \n Message Error: ' + loginError.value.message,
        status: 'error'
      }
    }

  }).catch((error) => {
    loginError.value = error
    // create notification on error
    notification.value = {
      message: 'Unable to login the user \n Message Error: ' + error.message,
      status: 'error'
    }
  })
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
    if (response.status === 200) {
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
