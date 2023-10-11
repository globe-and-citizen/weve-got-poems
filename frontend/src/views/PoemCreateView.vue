<script lang='ts' setup>

import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import Loader from '../components/CustomLoader.vue'
import AcNotification from '../components/ac-notification.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const content = ref('')
const title = ref('')

// Create Poem
const error = ref()
const data = ref()
const loading = ref()
const loaded = ref()
const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT

const appStore = useAppStore()
const notification = ref()
const submitPoem = async () => {
  loading.value = true
  await fetch(endpoint + '/poem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + appStore.getToken
    },
    body: JSON.stringify({
      title: title.value,
      content: content.value
    })
  })
      .then(response => {
        if (response.ok) {
          notification.value = {
            message: 'Poem created successfully',
            type: 'success'
          }
          return response.json()
        } else if (response.status >= 400 && response.status < 500) {
          throw new Error(`Unable to create the poem : Client Error: ${response.status} - ${response.statusText}`)
        } else {
          throw new Error(`Unable to create the poem : Server Error: ${response.status} - ${response.statusText}`)
        }
      })
      .then((response) => {
        data.value = response
        loaded.value = true
        // Redirect to post page after timeout
        setTimeout(() => {
          router.push('/poems/' + data.value.id)
        }, 2000)
      })
      .catch((error) => {
        notification.value = {
          message: 'Unable to create poem \n Message Error: ' + error.message,
          type: 'error'
        }
        error.value = error
      }).finally(() => {
        loading.value = false
      })
}
</script>

<template>
  <div>
    <div>
    </div>
    <div class='sm:mx-auto sm:w-full sm:max-w-sm'>
      <h2 class='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
        Create a Poem</h2>
    </div>
    <div class='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
      <form class='space-y-6' @submit.prevent='submitPoem'>
        <ac-notification v-if='notification' :variant='notification.status'>
          {{ notification.message }}
        </ac-notification>
        <div>
          <label class='block text-sm font-medium leading-6 text-gray-900' for='title'>Title</label>
          <div class='mt-2'>
            <input id='title' v-model='title' autocomplete='title'
                   class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                   name='title' required
                   type='text' />
          </div>
        </div>
        <div>
          <div class='flex items-center justify-between'>
            <label class='block text-sm font-medium leading-6 text-gray-900' for='content'>Content</label>
          </div>
          <div class='mt-2'>
            <textarea id='content' v-model='content' autocomplete='current-content'
                      class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                      name='content'
                      required
                      type='content' />
          </div>
        </div>

        <div>
          <button
              class='flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
              data-test='save-poem-button'
              type='submit'>
            <CustomLoader v-if='loading' class='mr-6' />
            Create Poem
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<style scoped>

</style>
