<template>
  <div ref="notify" class="w-full mb-2 select-none border-l-4 p-4" :class="getColor().value" data-cy="notification">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const notify = ref<HTMLDivElement | null>(null)
onMounted(() => {
  console.log()
  if (notify.value) {
    const anchors = notify.value.getElementsByTagName('a')
    for (let i = 0; i < anchors.length; i++) {
      anchors[i].classList.add(`text-${getColor()}-500`)
      anchors[i].classList.add('font-medium')
    }
  }
})

interface Props {
  variant: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  color: 'blue'
})

const getColor = () => {
  let res = 'blue'
  let value = 'text-blue-500 border-blue-400  hover:border-blue-500 bg-blue-100'
  switch (props.variant) {
    case 'default':
      res = 'blue'
      value = 'text-blue-500 border-blue-400  hover:border-blue-500 bg-blue-100'
      break
    case 'error':
      res = 'red'
      value = 'text-red-500 border-red-400  hover:border-red-500 bg-red-100'
      break
    case 'info':
      res = 'blue'
      value = 'text-blue-500 border-blue-400  hover:border-blue-500 bg-blue-100'
      break
    case 'success':
      res = 'green'
      value = 'text-green-500 border-green-400  hover:border-green-500 bg-green-100'
      break
    case 'warning':
      value = 'text-yellow-500 border-yellow-400  hover:border-yellow-500 bg-yellow-100'
      res = 'yellow'
      break
  }
  return { value, res }
}
</script>

<style lang="scss">
a {
  //color: blue;
  //color: v-bind(color);
}
</style>
