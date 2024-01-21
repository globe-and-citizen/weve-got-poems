<template>
  <div class="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div>
      <ac-notification v-if="notification" :variant="notification.status">
        {{ notification.message }}
      </ac-notification>
    </div>
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="my-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">User Account</h2>
      </div>
      <form class="space-y-6" @submit.prevent="submitUpdate">
        <div>
          <label class="block text-sm font-medium leading-6 text-gray-900" for="name">Wallet Address</label>
          <div class="mt-2">
            <input
              id="name"
              :value="appStore.getUser.eth_address"
              class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              name="name"
              disabled
              type="text"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium leading-6 text-gray-900" for="name">Displayed Name</label>
          <div class="mt-2">
            <input
              id="name"
              v-model="name"
              class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              name="name"
              required
              type="text"
            />
          </div>
        </div>

        <div>
          <button
            class="flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            data-test="login-button"
            type="submit"
          >
            <CustomLoader v-if="updateLoading" class="mr-6" />
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss"></style>

<script setup lang="ts">
import CustomLoader from '@/components/CustomLoader.vue'
import AcNotification from '@/components/ac-notification.vue'
import { useAppStore } from '@/stores/app'
import { ref } from 'vue'

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT

const appStore = useAppStore()

const name = ref('')

if (appStore.getUser) {
  name.value = appStore.getUser.name
}

const updateError = ref()
const updateData = ref()
const updateLoading = ref(false)

const notification = ref()

const submitUpdate = async () => {
  // Handle fetch in a try catch
  try {
    updateLoading.value = true

    // TODO: remove this ts-ignore
    //@ts-ignore
    const response = await layer8.fetch(endpoint + '/user/' + appStore.getUser.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + appStore.getToken
      },
      body: JSON.stringify({
        name: name.value
      })
    })
    if (response.ok) {
      // Successful response
      updateData.value = await response.json()
      if (updateData.value.token) {
        appStore.setToken(updateData.value.token)
      }
      // Notification message
      notification.value = {
        message: 'User Successfully updated! ',
        status: 'success'
      }
    } else if (response.status >= 400 && response.status < 500) {
      // Client error
      notification.value = {
        message: `Unable to update the user  : Client Error: ${response.status} - ${response.statusText}`,
        status: 'error'
      }
    } else {
      // Server error
      notification.value = {
        message: `Unable to update the user  : Server Error: ${response.status} - ${response.statusText}`,
        status: 'error'
      }
    }
  } catch (error: any) {
    // Network error or other unexpected errors
    notification.value = {
      message: `Unable to update the user  : Unexpected Error: ${error.message}`,
      status: 'error'
    }
    updateError.value = error
  } finally {
    updateLoading.value = false
  }
}
</script>
