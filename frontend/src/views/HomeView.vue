<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'


const data = ref()

const appStore = useAppStore()
onMounted(async () => {
  const response = await fetch('https://weve-got-poems-server.onrender.com/v1/poems')
  data.value = await response.json()
})
</script>

<template>
  <main>
    <TheWelcome :data='data' v-if='data'/>
    <p v-else>loading ...</p>
    // TODO : Pagination Here
  </main>
</template>
