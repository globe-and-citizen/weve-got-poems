<script setup lang='ts'>
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/app'

// get the props
const props = defineProps({
  data: {
    type: Array<any>,
    required: true
  }
})
const appStore = useAppStore()

</script>

<template>
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

</template>
