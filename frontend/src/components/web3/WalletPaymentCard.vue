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
        <!-- Input for USD Amount -->
        <q-input
          v-model="usdAmount"
          label="Price in USD"
          type="number"
          min="1"
          @update:model-value="convertToMatic()"
          icon="attach_money"
        />
        <!-- Displaying Corresponding Ether Amount -->
        <q-input
          data-text="amount"
          v-model="maticAmount"
          label="Price in matic"
          mask="#.######"
          fill-mask="0"
          icon="account_balance_wallet"
          reverse-fill-mask
          readonly
        ></q-input>
        <q-card-actions align="right">
          <q-btn color="dark" label="Cancel" v-close-popup />
          <q-btn
            label="proceed payment"
            :disable="!maticAmount"
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
import { useWallet } from '../../composables/useWallet';
import { useAppStore } from '../../stores/app';

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
import { useCTransactionStore } from '../../stores/cryptoTransactions';

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

const usdAmount = ref<number | null>(null);
const etherAmount = ref<string>('');
const maticAmount = ref<string>('');
const maticRate = ref<number>(0);
const etherRate = ref<number>(0);

onMounted(async() => {
  _walletAddress.value = props.walletAddress;
  senderWalletAddress.value = appStore?.getUser?.eth_address;
  await fetchMaticRate();
});

function convertToEther() {
  console.log('convert to ether called');
  if (maticRate.value && usdAmount.value) {
    etherAmount.value = (usdAmount.value / maticRate.value).toFixed(6);
  }
}

function convertToMatic() {
  //console.log('convert to matic called');
  if (maticRate.value && usdAmount.value) {
    maticAmount.value = (usdAmount.value / maticRate.value).toFixed(6);
  }
}


async function fetchMaticRate() {
  try {
    const maticRateApiLink='https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=USD'
    const response = await fetch(maticRateApiLink);
    const data = await response.json();
    console.log("the data ===== ", data);
    maticRate.value = data['matic-network'].usd;
    //console.log("the ether rate ====== ",maticRate.value);
  } catch (error) {
    console.error('Error fetching Matic rate:', error);
    $q.notify({ type: 'negative', message: 'Failed to fetch Matic rate' });
  }
}

async function fetchEtherRate() {
  try {
    //const maticRateApiLink=""
    const etherRateApiLink='https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD'
    const response = await fetch(etherRateApiLink);
    const data = await response.json();
    etherRate.value = data.ethereum.usd;
    //console.log("the ether rate ====== ",etherRate.value);
  } catch (error) {
    console.error('Error fetching ETH rate:', error);
    $q.notify({ type: 'negative', message: 'Failed to fetch ETH rate' });
  }
}

async function saveTransaction(payload: { poem_id: number; tx_hash: string,network_name:string }) {
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
        .initiateSendEther(props.walletAddress, maticAmount.value)
        .then(async (transactionResult) => {
          if (transactionResult?.success == true) {
            console.log('the transaction result ========= ', transactionResult);
            const payload = {
              poem_id: props.poem?.id,
              tx_hash: transactionResult.transactionId,
              network_name: transactionResult.networkName
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
