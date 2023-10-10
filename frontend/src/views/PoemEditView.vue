<script lang='ts' setup>

import { computed, ref, watchEffect } from 'vue'
import { useAppStore } from '@/stores/app'
import Loader from '../components/CustomLoader.vue'
import AcNotification from '../components/ac-notification.vue'
import { useRouter } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

const router = useRouter()
const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT

const appStore = useAppStore()
const notification = ref()
const index = ref()
const title = ref()
const content = ref()

interface DataModel {
  id: number
  title: string
  content: string
  created_at: string
  dislikes: Array<number>
  likes: Array<number>
  user: {
    id: number
    name: string
  }
}

const { error, data, loading, isLoaded } = useFetch<Array<DataModel>>(endpoint + '/poems/')

const editError = ref()
const editData = ref()
const editLoading = ref()


// const {
//   error: editError,
//   data: editData,
//   loading: editLoading,
//   execute: executeEdit
// } = useFetchDelay(endpoint + '/poem/' + router.currentRoute.value.params.id, {
//   method: 'PUT',
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer ' + appStore.getToken
//   },
//   body: JSON.stringify({
//     title: title.value,
//     content: content.value
//   })
// })
const getCurrentPoem = () => {
  if (!data.value) return
  return data.value.find((poem: any, i: number) => {
    if (poem.id === parseInt(router.currentRoute.value.params.id as string)) {
      return poem
    }
  })
}
const poem = computed(() => getCurrentPoem())

watchEffect(() => {
  // Set title and content value if poem is loaded
  if (poem.value && !title.value && !content.value) {
    title.value = poem.value.title
    content.value = poem.value.content
  }
})
const submitPoem = async () => {
  // handle poem update in try catch
  try {
    editLoading.value = true
    const response = await fetch(endpoint + '/poem/' + router.currentRoute.value.params.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + appStore.getToken
      },
      body: JSON.stringify({
        title: title.value,
        content: content.value
      })
    })
    if (response.ok) {
      editData.value = await response.json()
      notification.value = {
        message: 'Poem updated successfully',
        type: 'success'
      }

      // redirection
      setTimeout(() => {
        router.push('/poems/' + router.currentRoute.value.params.id)
      }, 2000)
    } else if (response.status >= 400 && response.status < 500) {
      // Client error
      notification.value = {
        message: `Unable to update the poem : Client Error: ${response.status} - ${response.statusText}`,
        status: 'error'
      }
    } else {
      // Server error
      notification.value = {
        message: `Unable to update the poem : Server Error: ${response.status} - ${response.statusText}`,
        status: 'error'
      }
    }
  } catch (e: any) {
    notification.value = {
      message: `Unable to update the poem : ${e.message}`,
      status: 'error'
    }
    editError.value = e
  } finally {
    editLoading.value = false
  }
}
</script>

<template>
  <div>
    <div>
    </div>
    <div class='sm:mx-auto sm:w-full sm:max-w-sm'>
      <h2 class='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
        Update a Poem</h2>
    </div>
    <div class='flex justify-center' data-test='loader' v-if='loading'>
      <CustomLoader />
    </div>
    <div class='mt-10 sm:mx-auto sm:w-full sm:max-w-sm' v-else>
      <form class='space-y-6' @submit.prevent='submitPoem'>
        <ac-notification v-if='notification' :variant='notification.status'>
          {{ notification.message }}
        </ac-notification>
        <div>
          <label class='block text-sm font-medium leading-6 text-gray-900' for='title'>Title</label>
          <div class='mt-2'>
            <input id='title' v-model='title' autocomplete='title'
                   class='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                   name='title' required=''
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
                      required=''
                      type='content' />
          </div>
        </div>

        <div>
          <button
            class='flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
            data-test='save-poem-button'
            type='submit'>
            <Loader v-if='editLoading' class='mr-6' />
            Update Poem
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<style scoped>

</style>
