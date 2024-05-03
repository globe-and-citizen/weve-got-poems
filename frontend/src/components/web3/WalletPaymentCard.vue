<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <q-input
          data-text="sender-wallet-address"
          hide-hint
          label="your wallet address"
          maxlength="80"
          required
          v-model="senderWalletAddress"
          disable
        />
        <q-input
          data-text="receiver-wallet-address"
          hide-hint
          label="creator wallet address"
          maxlength="80"
          required
          v-model="_walletAddress"
          disable
        />
        <q-input
          data-text="amount"
          v-model="amount"
          label="Price in ether"
          mask="#.######"
          fill-mask="0"
          icon="account_balance_wallet"
          reverse-fill-mask
        ></q-input>
        <q-card-actions align="right">
          <q-btn color="dark" label="Cancel" v-close-popup />
          <q-btn
            label="proceed payment"
            :disable="!amount"
            color="primary"
            data-test="confirm-delete-entry"
            type="submit"
            v-close-popup
            data-text="initiate-ether-btn"
          />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';
import { useWallet } from 'src/composables/useWallet';
import { useAppStore } from 'src/stores/app';
const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
import { useCTransactionStore } from 'src/stores/cryptoTransactions';

const $q = useQuasar();
const wallet = useWallet();
const appStore = useAppStore();
const cTransactionStore = useCTransactionStore();

const emit = defineEmits(['hideDialog']);
const props = defineProps({
  walletAddress: { type: String, required: true },
  poem: null,
});
const senderWalletAddress = ref<string | null>(null);

const _walletAddress = ref('');
const amount = ref('');

onMounted(() => {
  _walletAddress.value = props.walletAddress;
  senderWalletAddress.value = appStore?.getUser?.eth_address;
});

async function saveTransaction(payload: { poem_id: number; tx_hash: string }) {
  $q.loading.show();
  const { success, data, error } =
    await cTransactionStore.saveTransaction(payload);
  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Transaction created successfully',
    });
    //title.value = '';
    //content.value = ''; // Resetting the form fields after successful submission
  } else {
    $q.notify({ type: 'negative', message: 'Error saving transactions' });
  }
  $q.loading.hide();
}
async function onSubmit() {
  $q.loading.show();
  if (!appStore.getUser) {
    $q.notify({ type: 'negative', message: 'please login!' });
  } else {
    try {
      await wallet
        .initiateSendEther(props.walletAddress, amount.value)
        .then(async (transactionResult) => {
          if (transactionResult?.success == true) {
            console.log('the transaction result ========= ', transactionResult);
            const payload = {
              poem_id: props.poem?.id,
              tx_hash: transactionResult.transactionId,
            };
            await saveTransaction(payload);
          } else {
            $q.notify({ type: 'negative', message: 'transaction failed' });
          }
        });
    } catch (error) {
      if (error) {
        console.log('the eroor message ', error);
        $q.notify({
          type: 'negative',
          message: ` ${error}`,
        });
      }

      emit('hideDialog');
    } finally {
      $q.loading.hide();
    }
  }

  emit('hideDialog');
}
</script>
