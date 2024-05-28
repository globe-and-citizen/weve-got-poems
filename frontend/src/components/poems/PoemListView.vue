<script lang="ts" setup>
// import DocumentationIcon from 'src/components/icons/IconDocumentation.vue';
import { computed, onMounted, ref } from 'vue';
import { useAppStore } from '../../stores/app';
import { usePoemStore } from '../../stores/poems';
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
const showPoemsList = ref(false);

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
    (dislike_author: any) => dislike_author === appStore.getUser?.id,
  );
});

const isDisliked = computed(() => {
  return !!selectedPoem.value?.dislikes.find(
    (like_author: any) => like_author === appStore.getUser?.id,
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

async function onCryptoPaymentDialog(poem: Poem | null) {
  if (poem) {
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
    //console.log('should notify');
    $q.notify({ type: 'negative', message: ' please login! ' });
    $q.loading.hide();
  } else {
    if (selectedPoem.value) {
      const { success, data, error } = await poemStore.onLike(
        selectedPoem.value.id,
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
    //console.log('should notify');
    $q.notify({ type: 'negative', message: ' please login! ' });
    $q.loading.hide();
  } else {
    if (selectedPoem.value) {
      const { success, data, error } = await poemStore.onDisLike(
        selectedPoem.value.id,
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
  //console.log('the current user ', appStore.getUser);
});

async function loadPoems() {
  $q.loading.show();
  const { success, data, error } = await poemStore.loadPoems();
  if (success) {
    if (data) {
      poems.value = data;
      if (selectedPoem.value?.id) {
        const updatedPoem = poems.value?.find(
          (poem) => poem.id === selectedPoem.value?.id,
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

function togglePoemsList() {
  showPoemsList.value = !showPoemsList.value;
}
</script>

<template>
  <div class="q-pa-md row h-screen" data-text="poems_list">
    <!-- Poems list on the left in a card with shadow -->
    <div
      class="col-3 q-mr-xl Card"
      @click="togglePoemsList"
      style="position: relative"
    >
      <div v-if="!showPoemsList" class="my-card poem-button">
        <q-card-section class="text-h6">
          Poems List ({{ poems?.length }})
        </q-card-section>
      </div>
      <q-card v-else class="my-card" style="position: relative; z-index: 1">
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
    <div class="col-8 CardPoems" data-text="selected_poem">
      <div class="parchment"></div>
      <q-card class="poem-card"  v-if="selectedPoem">
        <q-card-section class="flex justify-between w-full">
          <q-btn
            class="action"
            icon="chevron_left"
            @click="selectPreviousPoem()"
          />
          <div class="poem-title">{{ selectedPoem.title }}</div>
          <q-btn
            class="action"
            icon="chevron_right"
            @click="selectNextPoem()"
          />
        </q-card-section>
        <q-card-section>
          <div
            class="poem-content text-negative"
            v-html="selectedPoem.content"
          ></div>
          <div class="poem-date">
            {{ new Date(selectedPoem.created_at).toLocaleDateString() }}
          </div>
        </q-card-section>
        <q-card-section class="actions-section">
          <q-btn @click="onCryptoPaymentDialog(selectedPoem)">
            <q-icon name="local_cafe"></q-icon>
            <span>Support</span>
          </q-btn>
          <span
            ><q-btn
              @click="onLike()"
              flat
              class="text-primary like-button"
              :disabled="isLiked"
            >
              {{ selectedPoem.likes.length }}
              <q-icon color="primary" name="thumb_up" />
            </q-btn>
            <q-btn
              @click="onDisLike()"
              flat
              class="text-red dislike-button"
              :disabled="isDisliked"
            >
              {{ selectedPoem.dislikes.length }}
              <q-icon color="red" name="thumb_down" /> </q-btn
          ></span>
        </q-card-section>
      </q-card>
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
    </q-card>
  </q-dialog>

  <svg>
    <filter id="wavy2">
      <feTurbulence x="0" y="0" baseFrequency="0.02" numOctaves="5" seed="1" />
      <feDisplacementMap in="SourceGraphic" scale="20" />
    </filter>
  </svg>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bilbo+Swash+Caps&display=swap');

@font-face {
  font-family: Morris;
  src: url(https://cdn.statically.io/gh/EmmesCodes/Tipografias/dae9f5bb/MorrisInitials.ttf);
}

:root {
  --fontSize: calc((1vw + 1vh) * 0.75);
}

.parchment {
  padding: 1.5em;
  box-shadow:
    2px 3px 20px black,
    0 0 125px #8f5922 inset;
  background: #fffef0;
  filter: url(#wornEdges);
  border-radius: 10px;
  overflow: hidden;
  filter: url(#wavy2);
}

.poem-card{
  background: rgba(0,0,0,0.5);
  height: auto;
}

/* .parchment svg {

} */

.poem-card:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: conic-gradient(#fff3, #fff0 2% 24%, #fff2 25%, #4321 0, #0000 27% 48%, #9632 50%, #fff2 0, #fff0 52% 73%, #9632 75%, #fff3 0, #fff0 78% 97%, #9632);
}

.poem-title {
  font-family: Pirata One;
  font-weight: 700;
  font-size: 1.8em;
  margin: 0;
  text-align: center;
}

.poem-content {
  font-family: 'Bilbo Swash Caps', cursive;
  font-weight: 600;
  line-height: 2rem;
  font-size: 2em;
  margin-top: 1em;
  text-align: justify;
  text-justify: inter-word;
}

.poema-content:not(:first-child)::first-letter {
  float: left;
  font: 1.7em/1em Morris;
  /* a little relief for the first letter*/
  text-shadow: 1px 1px 1px black;
  margin: 0 0.5rem;
}

.poem-date {
  text-align: right;
  font-style: italic;
  color: #777;
  margin-top: 1em;
}

.actions-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5em;
}

.q-btn {
  display: flex;
  align-items: center;
}

.q-btn span {
  margin-left: 0.5em;
}

.my-card {
  box-shadow:
    2px 3px 20px black,
    0 0 125px #8f5922 inset;
  background: #fffef0;
}

.poem-button {
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 8px;
}

.poem-button:hover {
  background-color: #eee;
}

.icon {
  position: absolute;
  left: 0.5em;
  top: 50%;
  transform: translateY(-50%);
}

@media (max-width: 708px){
  .action {
    display: none;
  }
}

/* Media queries */
@media (max-width: 658px) {
  .Card {
    width: 98%;
    margin: 3% auto;
    border-radius: 20px;
  }
  .CardPoems {
    width: 100%;
    height: 100%;
    margin: 3% auto;
    margin-bottom: 3%;
  }
  .action {
    display: none;
  }
  .poem-title{
    font-size: x-large;
  }
}
</style>
