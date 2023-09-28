<script setup lang='ts'>
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted, ref } from 'vue'
import { useAppStore } from '../stores/app.js'


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
    <div v-if='loading' class='flex justify-center' data-test='loading'>
      <div style='border-top-color:transparent'
           class='w-8 h-8 border-4 border-emerald-400 rounded-full animate-spin'></div>
    </div>
    <TheWelcome :data='data' v-if='data' />
    // TODO : Pagination Here
  </main>
</template>
