<script setup lang='ts'>
import { onMounted, ref, watchEffect } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DocumentationIcon from '@/components/icons/IconDocumentation.vue'
import WelcomeItem from '@/components/WelcomeItem.vue'
import { useAppStore } from '@/stores/app'
import { useFetch, useFetchDelay } from '@/composables/useFetch'
import Loader from '@/components/Loader.vue'

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT
const router = useRouter()
const appStore = useAppStore()

const data = ref()
const index = ref()
const nextId = ref()
const previousId = ref()

const notification = ref()

const { error, data: poems, loading, isLoaded } = useFetch(endpoint + '/poems/')
const {
  error: deleteError,
  data: deleteData,
  loading: deleteLoading,
  execute: executeDelete
} = useFetchDelay(endpoint + '/poem/' + router.currentRoute.value.params.id, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + appStore.getToken
  }
})


const getCurrentPoem = () => {
  if (!data.value) return
  return data.value.find((poem: any, i: number) => {
    if (poem.id === parseInt(router.currentRoute.value.params.id as string)) {
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
onMounted(async () => {
  const response = await fetch(endpoint + '/poems')
  data.value = await response.json()
})


const processDeleteNotification = () => {
  if (deleteData.value) {
    notification.value = {
      message: 'Poem deleted successfully',
      status: 'success'
    }
    // redirect to home page after timeout
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } else {
    if (deleteError.value) {
      notification.value = {
        message: `Unable to delete poem ${deleteError.value}`,
        status: 'error'
      }
    }
  }
}

watchEffect(() => {
  processDeleteNotification()
  currentPoem.value = getCurrentPoem()
  if (deleteError.value) {
    notification.value = {
      message: `Unable to delete poem ${deleteError.value}`,
      status: 'error'
    }
  }
})
const onDelete = async () => {
  const confirmation = window.confirm('Are you sure you want to delete this poem?')
  if (confirmation) {
    // delete poem
    const id = currentPoem.value.id
    deleteLoading.value = true
    if (executeDelete) {
      executeDelete()
    }
  }
}

</script>

<template>
  <main>
    <Loader v-if='loading' />
    <WelcomeItem v-if='currentPoem'>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <h1>{{ currentPoem.title }}</h1>
      </template>
      <div class='flex gap-2' v-if='currentPoem.author.id==appStore.getUser.id'>
        <RouterLink :to="'/poems/' + currentPoem.id+'/edit'">Edit</RouterLink>
        <a @click.prevent='onDelete()' data-test='remove-poem-button'>Remove</a>
      </div>
      {{ currentPoem.content }}
      <br>
      <br>
      {{ new Date(currentPoem.created_at).toLocaleDateString() }}
      <div>
        <div class='navigation'>
          <RouterLink :to="'/poems/' + previousId">Prev Poem</RouterLink>
          <RouterLink :to="'/poems/' + nextId">Next Poem</RouterLink>
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
