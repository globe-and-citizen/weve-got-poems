<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useWallet } from '../../../composables/useWallet';
import { useAppStore } from '../../../stores/app';
import { useCTransactionStore } from '../../../stores/cryptoTransactions';
import { usePoemStore } from '../../../stores/poems';

interface CTransactionDetail {
  amount: string;
  receiver: string;
  sender: string;
  transactionHash: string;
  checkLink: string;
  networkName: string;
}

interface CTransaction {
  id: number;
  tx_hash: string;
  network_name: string;
  poem_id: string;
  user_id: string;
}

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

const columns = [
  {
    name: 'transactionHash',
    required: true,
    label: 'Hash',
    field: 'transactionHash',
    sortable: true,
    visible: true,
  },
  {
    name: 'sender',
    required: true,
    label: 'Sender',
    field: 'sender',
    sortable: true,
    visible: true,
  },
  {
    name: 'receiver',
    required: true,
    label: 'Receiver',
    field: 'receiver',
    sortable: true,
    visible: true,
  },
  {
    name: 'amount',
    required: true,
    label: 'Amount',
    field: 'amount',
    sortable: true,
    visible: true,
  },
  {
    name: 'networkName',
    required: true,
    label: 'Network',
    field: 'networkName',
    sortable: true,
    visible: true,
  },

  {
    name: 'checkLink',
    required: true,
    label: 'Check Link',
    field: 'checkLink',
    sortable: true,
    visible: true,
  },
];
const filter = ref('');

const $q = useQuasar();
const cryptoTransactionStore = useCTransactionStore();
const cTransactions = ref<CTransactionDetail[]>([]);
const appStore = useAppStore();
const poemStore = usePoemStore();
const rows = computed(() => cTransactions.value);
const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
const poems = ref<Poem[]>([]);
const wallet = useWallet();

function openLink(url: string) {
  window.open(url, '_blank')?.focus();
}

onMounted(async () => {
  await loadPoems();
});

async function loadPoems() {
  if (!appStore?.getUser?.id) {
    $q.notify({
      type: 'negative',
      message: 'please login first !',
    });
  } else {
    $q.loading.show();
    const { success, data, error } = await poemStore.loadPaidPoemsByAuthor(
      true,
      appStore.getUser.id,
    );
    if (success) {
      if (data) {
        poems.value = data;
        console.log('the poems ======= ', data);
        poems.value.forEach(async (poem) => {
          const response = await fetch(
            endpoint + `/ctransactions/?poem_id=${poem.id}`,
            {
              method: 'GET',
            },
          );
          const cryptoTransactionExist = await response.json();

          cryptoTransactionExist.forEach(async (cTransaction: CTransaction) => {
            const retreivedTransactionDetail =
              await wallet.getTransactionDetails(
                cTransaction?.tx_hash,
                cTransaction?.network_name,
              );
            const amount = retreivedTransactionDetail?.amount
              ? retreivedTransactionDetail?.amount
              : '0';
            const checkLink = cTransaction?.network_name.includes('sepolia')
              ? import.meta.env.VITE_ALCHEMY_SEPOLIA_SCAN_URL +
                cTransaction?.tx_hash
              : import.meta.env.VITE_ALCHEMY_POLYGON_AMOY_SCAN_URL +
                cTransaction?.tx_hash;

            cTransactions.value.push({
              amount: amount,
              receiver: retreivedTransactionDetail?.receiver
                ? retreivedTransactionDetail?.receiver
                : '',
              sender: retreivedTransactionDetail?.sender
                ? retreivedTransactionDetail?.sender
                : '',
              transactionHash: cTransaction?.tx_hash,
              checkLink: checkLink,
              networkName: cTransaction?.network_name,
            });
          });
        });
      }
    }
    $q.loading.hide();
  }
}
</script>

<template>
  <div class="q-pa-md">
    <q-table
      :dense="$q.screen.lt.md"
      bordered
      title="Transactions List"
      :rows="rows"
      :columns="columns"
      :visible-columns="columns"
      :filter="filter"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-checkLink="props">
        <q-td :props="props">
          <q-icon
            name="open_in_new"
            class="cursor-pointer"
            @click="openLink(props.row.checkLink)"
          ></q-icon>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
