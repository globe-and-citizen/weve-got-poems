<script setup lang="ts">
import CustomLoader from '@/components/CustomLoader.vue'
import WelcomeItem from '@/components/WelcomeItem.vue'
import AcNotification from '@/components/ac-notification.vue'
import IconDislike from '@/components/icons/IconDislike.vue'
import DocumentationIcon from '@/components/icons/IconDocumentation.vue'
import IconLike from '@/components/icons/IconLike.vue'
import { useAppStore } from '@/stores/app'
import { computed, onMounted, ref, watchEffect } from 'vue'

import { RouterLink, useRouter } from 'vue-router'
//@ts-ignore
import layer8_interceptor from 'layer8_interceptor'

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT
const router = useRouter()
const appStore = useAppStore()

const index = ref()
const nextId = ref()
const previousId = ref()

const notification = ref()

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
const data = ref()
const loading = ref(false)

const deleteError = ref()
const deleteLoading = ref()
const deleteIsLoaded = ref()

const executeDelete = async () => {
  try {
    const response = await layer8_interceptor.fetch(endpoint + '/poems/' + router.currentRoute.value.params.id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + appStore.getToken
      }
    })
    if (response.ok) {
      deleteIsLoaded.value = true
    } else if (response.status >= 400 && response.status < 500) {
      deleteError.value = `Client Error: ${response.status} - ${response.statusText}`
    } else {
      deleteError.value = `Server Error: ${response.status} - ${response.statusText}`
    }
  } catch (err: any) {
    deleteError.value = `Network Error: ${err.message}`
  } finally {
    deleteLoading.value = false
  }
}

const loadData = async () => {
  const response = await layer8_interceptor.fetch(endpoint + '/poems', { method: 'GET' })
  data.value = await response.json()
  loading.value = false
}
onMounted(async () => {
  loading.value = true
  // TODO: remove this timeout
  setTimeout(async () => {
    loadData()
  }, 5000)
})
const likeData = ref()
const likeError = ref()
const likeLoading = ref()
const likeLoaded = ref()

const dislikeData = ref()
const dislikeError = ref()
const dislikeLoading = ref()
const dislikeLoaded = ref()

const isLiked = computed(() => {
  return !!currentPoem.value.likes.find((dislike_author: any) => dislike_author === appStore.getUser?.id)
})

const isDisliked = computed(() => {
  return !!currentPoem.value.dislikes.find((like_author: any) => like_author === appStore.getUser?.id)
})
const getCurrentPoem = () => {
  if (!data.value) return
  return data.value.find((poem: any, i: number) => {
    if (data.value && poem.id === parseInt(router.currentRoute.value.params.id as string)) {
      index.value = i
      if (i === 0) {
        previousId.value = data.value[data.value.length - 1].id
      } else {
        previousId.value = data.value[i - 1]?.id
      }
      if (i === data.value.length - 1) {
        nextId.value = data.value[0].id
      } else {
        nextId.value = data.value[i + 1]?.id
      }
      return poem
    }
  })
}

const currentPoem = ref()

watchEffect(() => {
  currentPoem.value = getCurrentPoem()
  // if (deleteIsLoaded.value) {
  //   // redirect after timeout
  //   // if no error and poem is deleted successfully
  //   if (!deleteError.value) {
  //     notification.value = {
  //       message: 'Poem deleted successfully',
  //       status: 'success'
  //     }
  //     setTimeout(() => {
  //       router.push('/')
  //     }, 2000)
  //   } else {
  //     notification.value = {
  //       message: `Unable to delete poem ${deleteError.value}`,
  //       status: 'error'
  //     }
  //   }
  // }
})
const onDelete = async () => {
  const confirmation = window.confirm('Are you sure you want to delete this poem?')
  if (confirmation) {
    // delete poem
    deleteLoading.value = true
    executeDelete()
  }
}
const isCurrentPoemAuthor = () => {
  if (currentPoem.value) {
    return currentPoem.value.author.id === appStore.getUser?.id
  }
  return false
}

const onLike = async () => {
  console.log('Frontend: onLike')

  if (isLiked.value) return
  try {
    likeLoading.value = true
    const response = await layer8_interceptor.fetch(endpoint + '/poems/' + router.currentRoute.value.params.id + '/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + appStore.getToken
      },
      body: JSON.stringify({
        poem_id: currentPoem.value.id
      })
    })
    if (response.ok) {
      likeData.value = await response.json()
    } else if (response.status >= 400 && response.status < 500) {
      likeError.value = `Client Error: ${response.status} - ${response.statusText}`
    } else {
      likeError.value = `Server Error: ${response.status} - ${response.statusText}`
    }
    likeLoaded.value = true
  } catch (err: any) {
    likeError.value = `Network Error: ${err.message}`
  } finally {
    likeLoading.value = false
  }

  loadData()
  console.log('Frontend: onLike done')
}

const onDisLike = async () => {
  if (isDisliked.value) return
  try {
    dislikeLoading.value = true
    const response = await layer8_interceptor.fetch(endpoint + '/poems/' + router.currentRoute.value.params.id + '/dislike', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + appStore.getToken
      },
      body: JSON.stringify({
        poem_id: currentPoem.value.id
      })
    })
    if (response.ok) {
      dislikeData.value = await response.json()
    } else if (response.status >= 400 && response.status < 500) {
      dislikeError.value = `Client Error: ${response.status} - ${response.statusText}`
    } else {
      dislikeError.value = `Server Error: ${response.status} - ${response.statusText}`
    }
    dislikeLoaded.value = true
  } catch (err: any) {
    dislikeError.value = `Network Error: ${err.message}`
  } finally {
    dislikeLoading.value = false
  }
  loadData()
}
</script>

<template>
  <main>
    <div>
      <ac-notification v-if="notification" :variant="notification.status">
        {{ notification.message }}
      </ac-notification>
    </div>
    <CustomLoader v-if="loading" />
    <WelcomeItem v-if="currentPoem">
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <h1>{{ currentPoem.title }}</h1>
      </template>
      <div class="flex" :class="isCurrentPoemAuthor() ? 'justify-between' : 'justify-end'">
        <div class="flex gap-2" v-if="isCurrentPoemAuthor()">
          <RouterLink class="p-2 rounded" :to="'/poems/' + currentPoem.id + '/update'" data-test="update-poem-button">Edit</RouterLink>
          <a @click.prevent="onDelete()" data-test="remove-poem-button" class="p-2 rounded">Remove</a>
        </div>
        <div class="flex gap-2 justify-end">
          <div class="group relative">
            <span
              class="group-hover:opacity-100 opacity-0 absolute w-max bottom-full bg-black text-white p-1 rounded"
              v-if="!appStore.getToken"
            >
              You need to be authenticated
            </span>
            <a
              @click.prevent="appStore.getToken ? onLike() : ''"
              class="flex gap-2 p-2 rounded"
              :class="isLiked ? 'bg-emerald-800/20' : appStore.getToken ? 'cursor-pointer' : ''"
            >
              {{ currentPoem.likes.length }}
              <IconLike />
            </a>
          </div>
          <div class="group relative">
            <span
              class="group-hover:opacity-100 opacity-0 absolute w-max bottom-full bg-black text-white p-1 rounded"
              v-if="!appStore.getToken"
            >
              You need to be authenticated
            </span>
            <a
              @click.prevent="appStore.getToken ? onDisLike() : ''"
              class="flex gap-2 text-red-600 hover:bg-red-800/20 p-2 rounded"
              :class="isDisliked ? 'bg-red-800/20' : appStore.getToken ? 'cursor-pointer' : ''"
            >
              {{ currentPoem.dislikes.length }}
              <IconDislike />
            </a>
          </div>
        </div>
      </div>
      {{ currentPoem.content }}
      <br />
      <br />
      {{ new Date(currentPoem.created_at).toLocaleDateString() }}
      <div>
        <div class="navigation">
          <RouterLink :to="'/poems/' + previousId" class="p-2 rounded">Prev Poem</RouterLink>
          <RouterLink :to="'/poems/' + nextId" class="p-2 rounded">Next Poem</RouterLink>
        </div>
      </div>
    </WelcomeItem>
  </main>
</template>

<style scoped>
.navigation {
  display: flex;
  justify-content: space-between;
}
</style>
