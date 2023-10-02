<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DocumentationIcon from '@/components/icons/IconDocumentation.vue'
import WelcomeItem from '@/components/WelcomeItem.vue'


const router = useRouter()

const data = ref()
const index = ref()
const nextId = ref()
const previousId = ref()

const poem = () => {
  if (!data.value) return
  return data.value.find((poem, i) => {
    if (poem.id === parseInt(router.currentRoute.value.params.id)) {
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
onMounted(async () => {
  const response = await fetch('https://weve-got-poems-server.onrender.com/v1/poems')
  data.value = await response.json()
})


</script>

<template>
  <main>
    <WelcomeItem v-if='poem()'>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <h1>{{ poem().title }}</h1>
      </template>
      {{ poem().content }}
      <br>
      <br>
      {{ new Date(poem().created_at).toLocaleDateString() }}
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
