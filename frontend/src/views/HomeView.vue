<script lang='ts' setup>
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import CustomLoader from '@/components/CustomLoader.vue'
import WelcomeItem from '@/components/WelcomeItem.vue'
import { RouterLink } from 'vue-router'
import DocumentationIcon from '@/components/icons/IconDocumentation.vue'


const data = ref()
const loading = ref(false)

const appStore = useAppStore()
onMounted(async () => {
  loading.value = true
  const response = await fetch('https://weve-got-poems-server.onrender.com/v1/poems')
  data.value = await response.json()
  loading.value = false
})
</script>

<template>
  <main>
    <div class='flex justify-center' data-test='loader'>
      <CustomLoader v-if='loading' />
    </div>
    <WelcomeItem v-for='item in data' :key='item.id'
                 :data-test='item.author.id === appStore.getUser?.id ? "my-poem": "item"'>

      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <RouterLink :to="'/poems/' + item.id" data-test='item-heading'>{{ item.title }}</RouterLink>
      </template>
      {{ item.content }}
      <br>
      <br>
      {{ new Date(item.created_at).toLocaleDateString() }}
    </WelcomeItem>
  </main>
</template>
