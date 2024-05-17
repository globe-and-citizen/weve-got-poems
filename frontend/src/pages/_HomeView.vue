<script lang="ts" setup>
// import DocumentationIcon from 'src/components/icons/IconDocumentation.vue';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useAppStore } from '../stores/app';

interface Poem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  dislikes: Array<number>;
  likes: Array<number>;
  is_paid: boolean;
  user: {
    id: number;
    name: string;
    eth_address?: string;
  };
}

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
const $q = useQuasar();

const loading = ref<boolean>(false);
const selectedPoem = ref<Poem | null>(null);
const poems = ref<Poem[]>([]); // Initialized as an empty array
const selectedPoemIndex = ref<number | null>(null);
const leftDrawerOpen = ref<boolean>(true);

const likeData = ref();
const likeError = ref();
const likeLoading = ref();
const likeLoaded = ref();

const dislikeData = ref();
const dislikeError = ref();
const dislikeLoading = ref();
const dislikeLoaded = ref();

const isLiked = computed(() => {
  return !!selectedPoem.value?.likes.find(
    (dislike_author: any) => dislike_author === appStore.getUser?.id,
  );
});

const isDisliked = computed(() => {
  return !!selectedPoem.value?.dislikes.find(
    (like_author: any) => like_author === appStore.getUser?.id,
  );
});

function selectPoem(poem: Poem) {
  selectedPoem.value = poem;
  selectedPoemIndex.value = poems.value.findIndex((p) => p.id === poem.id);
}

const onLike = async () => {
  if (!appStore.getUser) {
    console.log('should notify');
    $q.notify({ type: 'negative', message: ' please login! ' });
  } else {
    console.log('on like called');
    try {
      console.log('on like called');
      likeLoading.value = true;
      const response = await fetch(
        endpoint + '/poems/' + selectedPoem.value?.id + '/like',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + appStore.getToken,
          },
          body: JSON.stringify({
            poem_id: selectedPoem.value?.id,
          }),
        },
      );
      if (response.ok) {
        likeData.value = await response.json();
      } else if (response.status >= 400 && response.status < 500) {
        likeError.value = `Client Error: ${response.status} - ${response.statusText}`;
      } else {
        likeError.value = `Server Error: ${response.status} - ${response.statusText}`;
      }
      likeLoaded.value = true;
    } catch (err: any) {
      likeError.value = `Network Error: ${err.message}`;
    } finally {
      likeLoading.value = false;
      loadPoems();
    }
  }
};

const onDisLike = async () => {
  if (!appStore.getUser) {
    console.log('should notify');
    $q.notify({ type: 'negative', message: ' please login! ' });
  } else {
    console.log('on dislike called');
    try {
      console.log('on dislike called');
      const response = await fetch(
        endpoint + '/poems/' + selectedPoem.value?.id + '/dislike',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + appStore.getToken,
          },
          body: JSON.stringify({
            poem_id: selectedPoem.value?.id,
          }),
        },
      );

      if (response.ok) {
        dislikeData.value = await response.json();
      } else if (response.status >= 400 && response.status < 500) {
        dislikeError.value = `Client Error: ${response.status} - ${response.statusText}`;
      } else {
        dislikeError.value = `Server Error: ${response.status} - ${response.statusText}`;
      }
      dislikeLoaded.value = true;
    } catch (err: any) {
      dislikeError.value = `Network Error: ${err.message}`;
      console.log('the eroor========== ', err);
    } finally {
      loadPoems();
    }
  }
};

function updateSelectedPoem() {
  if (!selectedPoem.value?.id) return;
  // Assuming 'poems' is the reactive state updated by loadPoems()
  // and contains the latest list of poems.
  const updatedPoem = poems.value?.find(
    (poem) => poem.id === selectedPoem.value?.id,
  );

  // Re-specify selectedPoem with its updated version from the list
  if (updatedPoem) {
    selectedPoem.value = updatedPoem;
  } else {
    // Handle the case where the poem might no longer exist, if necessary
    console.error('Selected poem not found in the updated list');
    // Possible action: clear selectedPoem or set it to a default state
    selectedPoem.value = null;
  }
}
function likePoem() {
  console.log('poem liked');
  // Your logic for liking a poem
}
function dislikePoem() {
  console.log('poem disliked');
  // Your logic for disliking a poem
}

function selectNextPoem() {
  if (selectedPoemIndex.value !== null && poems.value.length > 0) {
    const nextIndex = (selectedPoemIndex.value + 1) % poems.value.length;
    selectPoem(poems.value[nextIndex]);
  }
}

function selectPreviousPoem() {
  if (selectedPoemIndex.value !== null && poems.value.length > 0) {
    const prevIndex =
      (selectedPoemIndex.value - 1 + poems.value.length) % poems.value.length;
    selectPoem(poems.value[prevIndex]);
  }
}

const appStore = useAppStore();

onMounted(async () => {
  await loadPoems();
  console.log('the current user ', appStore.getUser);
});

async function loadPoems() {
  $q.loading.show();

  // TODO: remove this ts-ignore
  //const response = await layer8.fetch(endpoint + '/poems/', { method: 'GET' })
  const response = await fetch(endpoint + '/poems/', { method: 'GET' });

  console.log('Frontend: going to try now 2...');
  // log response body
  // console.log('Frontend: response body', response.body)
  poems.value = await response.json();
  console.log('data value', poems.value);
  if (selectedPoem.value?.id) {
    const updatedPoem = poems.value?.find(
      (poem) => poem.id === selectedPoem.value?.id,
    );
    // Re-specify selectedPoem with its updated version from the list
    if (updatedPoem) {
      selectedPoem.value = updatedPoem;
    }
  }
  $q.loading.hide();

  //console.log('try layer8'
}
</script>

<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <!-- Poems list on the left in a card with shadow -->
    <div class="col-4">
      <q-card class="my-card">
        <q-card-section class="text-h6">
          Poems List ({{ poems?.length }})
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item
              v-for="poem in poems"
              :key="poem.id"
              clickable
              v-ripple
              @click="selectPoem(poem)"
            >
              <q-item-section>
                <q-item-label>{{ poem.title }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Poem details on the right in a card with shadow -->
    <div class="col-6">
      <q-card class="my-card" v-if="selectedPoem">
        <q-card-section class="flex justify-between items-center">
          <q-btn
            icon="chevron_left"
            @click="selectPreviousPoem()"
            label="Previous"
          />
          <!-- Your poem content and other elements go here -->
          <q-btn icon="chevron_right" @click="selectNextPoem()" label="Next" />
        </q-card-section>
        <q-card-section>
          <div class="text-h5 poem-title" data-test="poem-heading">
            {{ selectedPoem.title }}
          </div>
          <div
            class="overflow-auto poem-content"
            v-html="selectedPoem.content"
          ></div>
          <div>
            {{ new Date(selectedPoem.created_at).toLocaleDateString() }}
          </div>
        </q-card-section>
        <q-card-section class="flex justify-between">
          <q-btn
            @click="onLike()"
            flat
            class="text-primary"
            :disabled="isLiked"
          >
            {{ selectedPoem.likes.length }}
            <q-icon color="primary" name="thumb_up" class="cursor-pointer" />
          </q-btn>
          <q-btn
            @click="onDisLike()"
            flat
            class="text-red"
            :disabled="isDisliked"
          >
            {{ selectedPoem.dislikes.length }}
            <q-icon color="red" name="thumb_down" class="cursor-pointer" />
          </q-btn>
        </q-card-section>
        <!-- <q-card-section class="flex justify-between">
          <q-icon
            name="chevron_left"
            class="cursor-pointer"
            @click="selectPreviousPoem()"
          />
          <q-icon
            name="chevron_right"
            class="cursor-pointer"
            @click="selectNextPoem()"
          />
        </q-card-section> -->
      </q-card>

      <div
        v-else
        class="flex justify-center items-center text-grey"
        style="min-height: 200px"
      >
        Please select a poem to see the details.
      </div>
    </div>
  </div>
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
