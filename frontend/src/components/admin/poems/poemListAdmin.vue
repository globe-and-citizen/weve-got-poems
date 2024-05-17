<script lang="ts" setup>
// import DocumentationIcon from 'src/components/icons/IconDocumentation.vue';
import { useAppStore } from 'src/stores/app';
import { usePoemStore } from 'src/stores/poems';
import { computed, onMounted, ref } from 'vue';

import { useQuasar } from 'quasar';
import CryptoTransactionDetailCard from 'src/components/cryptoTransactions/CryptoTransactionDetailCard.vue';
import PoemEditCardView from 'src/components/poems/PoemEditCardView.vue';
import WalletPaymentCard from 'src/components/web3/WalletPaymentCard.vue';
import { useWallet } from 'src/composables/useWallet';

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

interface CTransaction {
  id: number;
  user_id: number;
  peom_id: number;
  tx_hash: string;
  created_at: string;
}
interface ColumnType {
  name: string;
  required: boolean;
  label: string;
  field: string;
  sortable: boolean;
}
const columns = [
  {
    name: 'author',
    required: true,
    label: 'Author',
    field: (row: Poem) => row?.author?.eth_address,
    sortable: true,
    visible: true,
  },
  {
    name: 'title',
    required: true,
    label: 'Title',
    field: 'title',
    sortable: true,
  },
  {
    name: 'content',
    required: true,
    label: 'Content',
    field: 'content',
    sortable: true,
  },
  {
    name: 'likes',
    required: true,
    label: 'Likes',
    field: (row: Poem) => row?.likes?.length,
    sortable: true,
  },
  {
    name: 'dislikes',
    required: true,
    label: 'Dislikes',
    field: (row: Poem) => row?.dislikes?.length,
    sortable: true,
  },

  {
    name: 'created_at',
    required: true,
    label: 'created_at',
    field: (row: Poem) => new Date(row?.created_at).toLocaleDateString(),
    sortable: true,
  },
  {
    name: 'action',
    required: true,
    label: 'Action',
    field: (row: Poem) => row,
    sortable: true,
    visible: true,
  },
];

const $q = useQuasar();
const poemStore = usePoemStore();
const rows = computed(() => poems.value);

const filter = ref('');

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;

const selectedPoem = ref<Poem | null>(null);
const poems = ref<Poem[]>([]); // Initialized as an empty array

const displayContentDialog = ref({ show: false, poem: { content: '' } });
const editPoemDialog = ref<{ show: boolean; poem?: Poem }>({ show: false });
const crytptoTransactionDialog = ref<{
  show: boolean;
  poem?: Poem;
  cTransaction?: CTransaction;
}>({ show: false });

const cryptoPaymentDialog = ref<{
  show: boolean;
  poem?: Poem;
  eth_address: string;
}>({
  show: false,
  eth_address: '',
});

const isAllPoems = ref({ label: 'all poems', value: true });

const options = [
  {
    label: 'all poems',
    value: true,
  },
  {
    label: 'my poems',
    value: false,
  },
];

const pagination = ref({ rowsPerPage: 0 });
function onDisplayContentDialog(poem: Poem) {
  displayContentDialog.value.show = true;
  displayContentDialog.value.poem = poem;
}

async function onCryptoPaymentDialog(poem: Poem) {
  if (!appStore?.getUser?.id) {
    $q.notify({
      type: 'negative',
      message: 'please login first !',
    });
  } else {
    const response = await fetch(
      endpoint + `/ctransactions/?poem_id=${poem.id}`,
      {
        method: 'GET',
      },
    );
    const cryptoTransactionExist = await response.json();
    if (cryptoTransactionExist.length > 0) {
      console.log(
        'the cypto transactions ============== ',
        cryptoTransactionExist,
      );
      crytptoTransactionDialog.value.cTransaction = cryptoTransactionExist[0];
      crytptoTransactionDialog.value.show = true;
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
function onEditPoemDialog(poem: Poem) {
  if (!appStore.getUser) {
    $q.notify({ type: 'negative', message: ' please login! ' });
  } else {
    editPoemDialog.value.show = true;
    editPoemDialog.value.poem = poem;
  }
}

const appStore = useAppStore();
const wallet = useWallet();

onMounted(async () => {
  await loadPoems();
});

const handleCloseDialog = () => {
  editPoemDialog.value.show = false;
};

async function loadPoems() {
  $q.loading.show();
  const { success, data, error } = await poemStore.loadPoems();
  if (success) {
    if (data) {
      poems.value = data;
      if (isAllPoems?.value?.value == false) {
        if (!appStore.getUser) {
          $q.notify({ type: 'negative', message: ' please login! ' });
        } else {
          poems.value = poems.value.filter(
            (poem: Poem) => poem.author.id == appStore.getUser?.id,
          );
        }
      }
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
      }
    }
  }
  $q.loading.hide();
}
</script>

<template>
  <div class="q-pa-md">
    <q-table
      :dense="$q.screen.lt.md"
      bordered
      title="Poems List"
      :rows="rows"
      :columns="columns"
      :visible-columns="columns"
      :filter="filter"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-form>
          <div class="row">
            <div class="col-5">
              <q-select
                @update:model-value="loadPoems"
                flat
                name="Filter"
                v-model="isAllPoems"
                :options="options"
                color="primary"
                filled
                clearable
                label="Filter"
                data-text="poems-filter"
              />
            </div>
            <div class="col-1"></div>
            <div class="col-6">
              <q-input
                borderless
                dense
                debounce="300"
                v-model="filter"
                placeholder="Search"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </template>

      <!-- Custom slot for content column -->
      <template v-slot:body-cell-content="props">
        <q-td :props="props">
          <q-btn flat @click="onDisplayContentDialog(props.row)">
            <q-icon name="visibility"></q-icon>
          </q-btn>
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            flat
            v-if="props.row.author?.id === appStore.getUser?.id"
            @click="onEditPoemDialog(props.row)"
          >
            <q-icon name="edit"></q-icon>
          </q-btn>
          <q-btn
            data-text="payment-btn"
            flat
            @click="onCryptoPaymentDialog(props.row)"
          >
            <q-icon
              :color="props.row.is_paid == true ? 'green' : ''"
              name="payment"
            ></q-icon>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="displayContentDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Poem Content</h6>
      </q-card-section>
      <q-card-section>
        <span class="q-ml-sm">
          {{ displayContentDialog.poem!?.content }}
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog full-width v-model="editPoemDialog.show">
    <q-card>
      <q-card-section>
        <PoemEditCardView
          :poem="editPoemDialog.poem"
          @hide-dialog="handleCloseDialog"
        />
      </q-card-section>
      <!-- <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" v-close-popup />
      </q-card-actions> -->
    </q-card>
  </q-dialog>

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

  <q-dialog v-model="crytptoTransactionDialog.show">
    <q-card style="width: 400px; max-width: 60vw">
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Transaction Detail</h6>
      </q-card-section>
      <CryptoTransactionDetailCard
        :cryptoTransaction="crytptoTransactionDialog.cTransaction"
      />
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
