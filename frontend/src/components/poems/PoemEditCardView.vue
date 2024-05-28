<script lang="ts" setup>
import { useAppStore } from 'src/stores/app';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePoemStore } from 'src/stores/poems';

const router = useRouter();

const poemStore = usePoemStore();

// Create Poem
const $q = useQuasar();

const appStore = useAppStore();

const props = defineProps(['poem']);
const emit = defineEmits(['hideDialog']);
const poem = computed(() => {
  return props.poem;
});

onMounted(() => {
  if (!appStore.getUser) {
    $q.notify({ type: 'negative', message: ' please login! ' });
    $q.loading.show();
    setTimeout(() => {
      $q.loading.hide();
      router.push('/login');
    }, 2500);
  }
});

const onReset = () => {
  //title.value = '';
  //content.value = '';
};

const updatePoem = async () => {
  $q.loading.show();
  const { success, data, error } = await poemStore.updatetePoem(
    props.poem.id,
    poem.value.title,
    poem.value.content,
  );
  $q.loading.hide();
  if (success) {
    $q.notify({ type: 'positive', message: 'Poem updated successfully' });
    //title.value = '';
    //content.value = ''; // Resetting the form fields after successful submission
  } else {
    $q.notify({ type: 'negative', message: 'Error updating poem' });
  }
  emit('hideDialog');
};
</script>

<template>
  <!-- Poems list on the left in a card with shadow -->
  <div class="aa">
  <q-card flat class="my-card">
    <q-card-section class="text-h3">
      <div class="text-h5 text-weight-bold">Edit Poem</div>
    </q-card-section>
    <q-card-section class="text-h6">
      <q-form class="q-gutter-md" @submit="updatePoem()">
        <q-input
          filled
          label="Title *"
          hint=""
          v-model="poem.title"
          :rules="[(val) => !!val || 'TItle is required']"
        />

        <q-input
          v-model="poem.content"
          filled
          label="Content *"
          type="textarea"
          :rules="[(val) => !!val || 'Field is required']"
        />
        <q-card-actions align="right">
          <q-btn color="black" label="Cancel" v-close-popup />
          <q-btn label="Edit Poem" type="submit" color="primary" />
        </q-card-actions>
        <div class="text-right"></div>
      </q-form>
    </q-card-section>
  </q-card>
</div>
</template>

<style scoped>
</style>
