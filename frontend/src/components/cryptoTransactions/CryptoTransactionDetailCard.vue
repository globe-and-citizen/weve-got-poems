<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form>
        <q-input
          hide-hint
          label="Intiator"
          v-model="cryptoTransactionDetail.initiatorEmail"
          disable
        />

        <q-input
          v-model="cryptoTransactionDetail.amount"
          label="Amount"
          mask="#.######"
          fill-mask="0"
          icon="account_balance_wallet"
          reverse-fill-mask
          readonly
        />
        <q-input
          hide-hint
          label="sender"
          v-model="cryptoTransactionDetail.sender"
          readonly
        />
        <q-input
          hide-hint
          label="receiver"
          v-model="cryptoTransactionDetail.receiver"
          readonly
        />
        <q-input
          hide-hint
          label="status"
          v-model="cryptoTransactionDetail.status"
          readonly
        />
        <q-input
          hide-hint
          label="Hash"
          v-model="cryptoTransactionDetail.transactionHash"
          readonly
        />
        <q-input
          hide-hint
          label="Check"
          readonly
          v-model="cryptoTransactionDetail.checkLink"
        >
          <q-icon
            name="open_in_new"
            class="cursor-pointer"
            @click="openLink(cryptoTransactionDetail.checkLink)"
          ></q-icon>
        </q-input>
      </q-form>
      <q-card-actions align="right">
        <q-btn color="primary" label="Close" v-close-popup />
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';
import { useWallet } from 'src/composables/useWallet';

const $q = useQuasar();

const wallet = useWallet();

const emit = defineEmits(['hideDialog']);
const props = defineProps(['cryptoTransaction']);

const cryptoTransactionDetail = ref({
  initiatorEmail: '',
  amount: '',
  sender: '',
  receiver: '',
  status: '',
  transactionHash: '',
  checkLink: '',
});
const _initiator = ref('');

const amount = ref(0);

onMounted(async () => {
  $q.loading.show();
  await loadCrytptoTransactionDetail();
  $q.loading.hide();
});

function openLink(url: string) {
  window.open(url, '_blank')?.focus();
}

async function loadCrytptoTransactionDetail() {
  try {
    cryptoTransactionDetail.value.transactionHash =
      props.cryptoTransaction?.tx_hash;
    const initiator = props.cryptoTransaction?.user_id;

    const retreivedTransactionDetail = await wallet.getTransactionDetails(
      props.cryptoTransaction?.tx_hash
    );
    console.log(
      'the transactions detail ========== ',
      retreivedTransactionDetail
    );
    if (retreivedTransactionDetail) {
      cryptoTransactionDetail.value.initiatorEmail = initiator;
      cryptoTransactionDetail.value.sender = retreivedTransactionDetail.sender;
      cryptoTransactionDetail.value.receiver =
        retreivedTransactionDetail?.receiver
          ? retreivedTransactionDetail?.receiver
          : '';
      cryptoTransactionDetail.value.amount = retreivedTransactionDetail?.amount
        ? retreivedTransactionDetail?.amount
        : '';
      cryptoTransactionDetail.value.status = retreivedTransactionDetail.status;
      cryptoTransactionDetail.value.checkLink = `https://sepolia.etherscan.io/tx/${props.cryptoTransaction?.tx_hash}`;
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: ' the entry author should set wallet address ',
    });
    throw new Error(`Error geting transaction detail : ${error}`);
  }
}
</script>
