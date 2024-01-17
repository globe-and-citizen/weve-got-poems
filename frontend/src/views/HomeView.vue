<script lang="ts" setup>
import CustomLoader from '@/components/CustomLoader.vue'
import WelcomeItem from '@/components/WelcomeItem.vue'
import DocumentationIcon from '@/components/icons/IconDocumentation.vue'
import { useAppStore } from '@/stores/app'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT
const data = ref()
const loading = ref(false)

const appStore = useAppStore()
onMounted(async () => {
  loading.value = true
  setTimeout(async () => {
    console.log('going to try now 1...')

    const response = await layer8.fetch(endpoint + '/poems/', { method: 'GET' })

    console.log('going to try now 2...')

    data.value = await response.json()
    console.log('data value', data.value)

    console.log('try layer8')
    loading.value = false
  }, 5000)
})
</script>

<template>
  <main>
    <div class="flex justify-center" data-test="loader">
      <CustomLoader v-if="loading" />
    </div>
    <WelcomeItem v-for="item in data" :key="item.id" :data-test="item.author.id === appStore.getUser?.id ? 'my-poem' : 'item'">
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <RouterLink :to="'/poems/' + item.id" data-test="item-heading">{{ item.title }}</RouterLink>
      </template>
      {{ item.content }}
      <br />
      <br />
      {{ new Date(item.created_at).toLocaleDateString() }}
    </WelcomeItem>
  </main>
</template>
