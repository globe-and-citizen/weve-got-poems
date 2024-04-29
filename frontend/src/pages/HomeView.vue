<script lang="ts" setup>
import PoemListView from 'src/components/poems/PoemListView.vue';
</script>

<template>
  <PoemListView></PoemListView>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;700&display=swap');

.poem-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700; /* Use a bold weight for titles */
  font-size: 1.5em; /* Larger font size for titles */
  margin-bottom: 0.5em; /* Spacing between title and content */
}

.poem-content {
  font-family: 'Roboto', sans-serif;
  font-weight: 400; /* Normal weight for content */
  line-height: 1.6; /* Improve readability with increased line height */
  font-size: 1em; /* Standard font size for content */
  color: #333; /* Optional: a slightly softer color than black for the content */
  text-align: justify;
  text-justify: inter-word;
}

/* Add any additional styling for other elements as needed */
</style>
