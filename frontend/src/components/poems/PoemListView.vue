<script lang="ts" setup>
// import DocumentationIcon from 'src/components/icons/IconDocumentation.vue';
import { useAppStore } from '../../stores/app';
import { usePoemStore } from '../../stores/poems';
import { computed, onMounted, ref } from 'vue';
import WalletPaymentCard from '../web3/WalletPaymentCard.vue';

import { useQuasar } from 'quasar';

interface Poem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  dislikes: Array<number>;
  likes: Array<number>;
  is_paid: boolean;
  author: {
    id: number;
    name: string;
    eth_address?: string;
  };
}

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
const $q = useQuasar();
const poemStore = usePoemStore();

const selectedPoem = ref<Poem | null>(null);
const poems = ref<Poem[]>([]); // Initialized as an empty array
const selectedPoemIndex = ref<number | null>(null);

const likeData = ref();

const dislikeData = ref();

const handleCloseDialog = () => {
  return true;
};

const isLiked = computed(() => {
  return !!selectedPoem.value?.likes.find(
    (dislike_author: any) => dislike_author === appStore.getUser?.id
  );
});

const isDisliked = computed(() => {
  return !!selectedPoem.value?.dislikes.find(
    (like_author: any) => like_author === appStore.getUser?.id
  );
});

const cryptoPaymentDialog = ref<{
  show: boolean;
  poem?: Poem;
  eth_address: string;
}>({
  show: false,
  eth_address: '',
});

async function onCryptoPaymentDialog(poem: Poem|null) {
  if(poem){

 
  if (!appStore?.getUser?.id) {
    $q.notify({
      type: 'negative',
      message: 'please login first !',
    });
  } else {
    
    if (poem.author.eth_address && poem?.author?.eth_address.length > 20) {
      if (poem.author.eth_address != appStore?.getUser?.eth_address) {
        cryptoPaymentDialog.value.show = true;
        cryptoPaymentDialog.value.poem = poem;
        if (poem.author.eth_address) {
          cryptoPaymentDialog.value.eth_address = poem.author.eth_address;
        } else {
          cryptoPaymentDialog.value.eth_address = '';
        }
      } else {
        $q.notify({
          type: 'negative',
          message:
            "sender and receiver should have different wallet address: you can't sender money yo your self",
        });
      }
    } else {
      $q.notify({
        type: 'negative',
        message: "the author don't set a wallet address",
      });
    }
  
  }
}
}
async function selectPoem(poem: Poem) {
  selectedPoem.value = poem;
  selectedPoemIndex.value = poems.value.findIndex((p) => p.id === poem.id);
}

const onLike = async () => {
  $q.loading.show();
  if (!appStore.getUser) {
    console.log('should notify');
    $q.notify({ type: 'negative', message: ' please login! ' });
    $q.loading.hide();
  } else {
    if (selectedPoem.value) {
      const { success, data, error } = await poemStore.onLike(
        selectedPoem.value.id
      );
      if (success) {
        $q.loading.hide();
        if (data) {
          likeData.value = data;
        }
        await loadPoems();
      }
    }
  }
};

const onDisLike = async () => {
  $q.loading.show();
  if (!appStore.getUser) {
    console.log('should notify');
    $q.notify({ type: 'negative', message: ' please login! ' });
    $q.loading.hide();
  } else {
    if (selectedPoem.value) {
      const { success, data, error } = await poemStore.onDisLike(
        selectedPoem.value.id
      );
      if (success) {
        $q.loading.hide();
        if (data) {
          dislikeData.value = data;
        }
        await loadPoems();
      } else {
        $q.loading.hide();
        //$q.notify({ type: 'negative', message: 'Error retreiving  poem list' });
      }
    }
  }
};

function updateSelectedPoem() {
  if (!selectedPoem.value?.id) return;
  // Assuming 'poems' is the reactive state updated by loadPoems()
  // and contains the latest list of poems.
  const updatedPoem = poems.value?.find(
    (poem) => poem.id === selectedPoem.value?.id
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
  const { success, data, error } = await poemStore.loadPoems();
  if (success) {
    if (data) {
      poems.value = data;
      if (selectedPoem.value?.id) {
        const updatedPoem = poems.value?.find(
          (poem) => poem.id === selectedPoem.value?.id
        );
        // Re-specify selectedPoem with its updated version from the list
        if (updatedPoem) {
          selectedPoem.value = updatedPoem;
        }
      } else {
        $q.loading.hide();
        //$q.notify({ type: 'negative', message: 'Error retreiving  poem list' });
      }
    }
  }
  $q.loading.hide();
}
</script>

<template>
  <div class="q-pa-md row items-start q-gutter-md" data-text="poems_list">
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
    <div class="col-6" data-text="selected_poem">
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
          <q-btn @click="onCryptoPaymentDialog(selectedPoem)">
            <q-icon
            name="local_cafe"
            ></q-icon>
          </q-btn>
          <q-btn
            @click="onLike()"
            flat
            class="text-primary like-button"
            :disabled="isLiked"
          >
            {{ selectedPoem.likes.length }}
            <q-icon color="primary" name="thumb_up" class="cursor-pointer" />
          </q-btn>
          <q-btn
            @click="onDisLike()"
            flat
            class="text-red dislike-button"
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
  <q-dialog v-model="cryptoPaymentDialog.show">
    <q-card style="width: 400px; max-width: 60vw">
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Payment Confirmation</h6>
      </q-card-section>
      <walletPaymentCard
        :wallet-address="cryptoPaymentDialog.eth_address"
        @hide-dialog="handleCloseDialog"
        :poem="cryptoPaymentDialog.poem"
      />
      <!-- <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" v-close-popup />
      </q-card-actions> -->
    </q-card>
  </q-dialog>
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
