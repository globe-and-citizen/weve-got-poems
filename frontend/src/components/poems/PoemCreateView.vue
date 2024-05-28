<script lang="ts" setup>
import { useAppStore } from 'src/stores/app';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePoemStore } from 'src/stores/poems';

const router = useRouter();
const content = ref('');
const title = ref('');
const poemStore = usePoemStore();

// Create Poem

const $q = useQuasar();

const appStore = useAppStore();

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

const submitPoem = async () => {
  $q.loading.show();
  const { success, poem, error } = await poemStore.submitPoem(
    title.value,
    content.value
  );
  $q.loading.hide();
  if (success) {
    $q.notify({ type: 'positive', message: 'Poem created successfully' });
    //title.value = '';
    //content.value = ''; // Resetting the form fields after successful submission
  } else {
    $q.notify({ type: 'negative', message: 'Error creating poem' });
  }
};
</script>

<template>
  <div class="row">
    <!-- Poems list on the left in a card with shadow -->

    <div class="col-8 q-mx-auto ">
      <br />
      <q-card class="my-card q-mx-auto">
        <q-card-section class="text-h3">
          <div class="text-h5 text-weight-bold">Poem Creation</div>
        </q-card-section>
        <q-card-section class="text-h6">
          <q-form class="q-mx-auto" @submit="submitPoem()">
            <q-input
              filled
              label="Title *"
              hint=""
              data-text="poem-title"
              v-model="title"
              :rules="[(val) => !!val || 'TItle is required']"
            />

            <q-input
              v-model="content"
              filled
              data-text="poem-content"
              label="Content *"
              type="textarea"
              :rules="[(val) => !!val || 'Field is required']"
            />

            <div class="text-right">
              <q-btn
                data-text="poem-create-btn"
                label="Create Poem"
                type="submit"
                color="primary"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.my-card{
  box-shadow: 2px 3px 20px black, 0 0 125px #8f5922 inset;
  background: #fffef0;
}
</style>
