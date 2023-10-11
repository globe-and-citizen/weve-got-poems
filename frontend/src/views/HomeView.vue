<script lang='ts' setup>
import TheWelcome from '@/components/TheWelcome.vue'
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import Loader from '@/components/CustomLoader.vue'
import CustomLoader from '@/components/CustomLoader.vue'


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
    <TheWelcome v-if='data' :data='data' />
    // TODO : Pagination Here
  </main>
</template>
