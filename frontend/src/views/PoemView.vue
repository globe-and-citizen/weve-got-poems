<script setup lang='ts'>
import { ref, watchEffect } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DocumentationIcon from '@/components/icons/IconDocumentation.vue'
import WelcomeItem from '@/components/WelcomeItem.vue'
import { useAppStore } from '@/stores/app'
import { useFetch, useFetchDelay } from '@/composables/useFetch'
import CustomLoader from '@/components/CustomLoader.vue'
import AcNotification from '@/components/ac-notification.vue'

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

const { error, data, loading, isLoaded } = useFetch<Array<DataModel>>(endpoint + '/poems/')
const {
  error: deleteError,
  data: deleteData,
  loading: deleteLoading,
  isLoaded: deleteIsLoaded,
  execute: executeDelete
} = useFetchDelay(endpoint + '/poems/' + router.currentRoute.value.params.id, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + appStore.getToken
  }
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
  if (deleteIsLoaded.value) {
    // redirect after timeout
    console.log("1")
    // if no error and poem is deleted successfully
    if (!deleteError.value) {
      console.log("12")
      notification.value = {
        message: 'Poem deleted successfully',
        status: 'success'
      }
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      console.log("123")
      notification.value = {
        message: `Unable to delete poem ${deleteError.value}`,
        status: 'error'
      }
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
const isCurrentPoemAuthor = () => {
  if (currentPoem.value) {
    return currentPoem.value.author.id === appStore.getUser.id
  }
  return false
}

</script>

<template>
  <main>
    <div>
      <ac-notification v-if='notification' :variant='notification.status'>
        {{ notification.message }}
      </ac-notification>
    </div>
    <CustomLoader v-if='loading' />
    <WelcomeItem v-if='currentPoem'>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <h1>{{ currentPoem.title }}</h1>
      </template>
      <div class='flex gap-2' v-if='isCurrentPoemAuthor'>
        <RouterLink :to="'/poems/' + currentPoem.id+'/update'">Edit</RouterLink>
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
