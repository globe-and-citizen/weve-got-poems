<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted, ref } from 'vue'


const data = ref()

onMounted(async () => {
  const response = await fetch('https://weve-got-poems-server.onrender.com/v1/poems')
  data.value = await response.json()
})
</script>

<template>
  <main>
    <TheWelcome :data='data'/>
  </main>
</template>
