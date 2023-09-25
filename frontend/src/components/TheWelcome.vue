<script setup>
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'

// get the props
const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

</script>

<template>
  <WelcomeItem v-for='item in data' :key='item.id'>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>{{ item.title }}</template>
    {{ item.content }}
    <br>
    <br>
    {{ new Date(item.created_at).toLocaleDateString() }}
  </WelcomeItem>

</template>
