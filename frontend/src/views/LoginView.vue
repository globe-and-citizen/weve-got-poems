<template>
  <div class='flex  flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
    <div class='flex justify-center space-x-1 rounded-lg p-0.5 bg-slate-50 m-auto'>
      <button class='flex items-center rounded-md py-2 px-12 text-sm font-semibold' :class='{"bg-white shadow": status}'
              @click='setStatus(true)'>Login
      </button>
      <button
        class='flex items-center rounded-md py-2 px-12 text-sm font-semibold ' :class='{"bg-white shadow": !status}'
        @click='setStatus(false)'>
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
        <form class='space-y-6' action='#' method='POST'>
          <div>
            <label for='email' class='block text-sm font-medium leading-6 text-gray-900'>Email address</label>
            <div class='mt-2'>
              <input id='email' name='email' type='email' autocomplete='email' required=''
                     v-model='registerEmail'
                     class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6' />
            </div>
          </div>

          <div>
            <label for='email' class='block text-sm font-medium leading-6 text-gray-900'>Name</label>
            <div class='mt-2'>
              <input id='email' name='email' type='email' autocomplete='email' required='' v-model='registerName'
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

const status = ref(false)

const registerEmail = ref('')
const registerName = ref('')
const registerPassword = ref('')

const loginEmail = ref('')
const loginPassword = ref('')

const loginError = ref()
const loginData = ref()
const loginStatus = ref()

const appStore = useAppStore()

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
    loginData.value = await response.json()
    if (loginData.value.token) {
      appStore.setToken(loginData.value.token)
    }
    console.log('response', loginData.value)
  }).catch((error) => {
    loginError.value = error
    console.log(error)
  })
  // reset inputs values
  console.log(loginEmail.value, loginPassword.value)
  loginEmail.value = ''
  loginPassword.value = ''
  loginStatus.value = 'done'
}
</script>
