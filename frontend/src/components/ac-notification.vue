<template>
  <div ref="notify" class="w-full mb-2 select-none border-l-4  p-4 " :class="getClass()" data-cy="notification">
    <slot />
  </div>
</template>

<script setup lang="ts">

import { onMounted } from 'vue'

const notify = ref<HTMLDivElement | null>(null)
onMounted(() => {
  if (notify.value) {
    const anchors = notify.value.getElementsByTagName('a')
    for (let i = 0; i < anchors.length; i++) {
      anchors[i].classList.add(`text-${getColor()}-500`)
      anchors[i].classList.add('font-medium')
    }
  }
})

interface Props {
    variant: string,
    color?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  color: 'blue'
})

const getColor = () => {
  let res = 'blue'
  switch (props.variant) {
    case 'default':
      res = 'blue'
      break
    case 'error':
      res = 'red'
      break
    case 'info':
      res = 'blue'
      break
    case 'success':
      res = 'green'
      break
    case 'warning':
      res = 'yellow'
      break
  }
  return res
}
const getClass = () => {
  return `text-${getColor()}-500 border-${getColor()}-400  hover:border-${getColor()}-500 bg-${getColor()}-100`
}
</script>

<style lang="scss">
a {
  //color: blue;
  //color: v-bind(color);
}
</style>
