<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <!-- Poems list on the left in a card with shadow -->
    <div class="col-4">
      <q-card class="my-card">
        <q-card-section class="text-h6">
          Profile

          <div class="text-subtitle2">Signin with your ethereum account</div>
          <div v-if="walletAddress" class="text-subtitle2">
            <q-form class="q-gutter-md">
              <q-input
                filled
                readonly
                v-model="walletAddress"
                label="Your wallet address *"
                hint=""
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
              <!-- <q-btn @click.prevent="onSignIn()" color="secondary">
                <div class="ellipsis"><span icon="edit"></span>Update</div>
              </q-btn> -->
              <q-btn
                data-test="sign-button"
                @click.prevent="onLogout()"
                color="secondary"
              >
                <div class="ellipsis"><span icon="edit"></span>Logout</div>
              </q-btn>
            </q-form>
          </div>
          <br />
          <q-btn
            v-if="!walletAddress"
            @click.prevent="onSignIn()"
            color="primary"
          >
            <div data-test="sign-button" class="ellipsis">Sign in</div>
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useAppStore } from 'src/stores/app';
import { computed, onMounted, ref } from 'vue';
// import { useRouter } from 'vue-router';
//import AcNotification from 'src/components/ac-notification.vue';
import { useWallet } from 'src/composables/useWallet';

const notification = ref();

// const router = useRouter();

//console.log('==========================callledddddddddddddddd===========');

const appStore = useAppStore();
const wallet = useWallet();
const $q = useQuasar();
const walletAddress = ref<string | null>(null);
onMounted(() => {
  walletAddress.value = appStore?.getUser?.eth_address;
});
// eslint-disable-next-line vue/no-side-effects-in-computed-properties
computed(() => (walletAddress.value = appStore.getUser.eth_address));
const onLogout = () => {
  appStore.setToken('');
  walletAddress.value = '';
  $q.notify({
    type: 'positive',
    message: 'You have successfully logged out',
  });
};
const onSignIn = () => {
  try {
    wallet.signInWithEthereum().then((token) => {
      if (token) {
        appStore.setToken(token);
        // notify user that he is logged in
        $q.notify({
          type: 'positive',
          message: 'You have successfully logged in',
        });

        walletAddress.value = appStore.getUser.eth_address;
        // timeout before redirection
        // setTimeout(() => {
        //   router.push('/');
        // }, 5000);
      }
    });
  } catch (error) {
    //console.log('error=================================== ');
    $q.notify({ type: 'negative', message: `${error}` });
  }
};

if (appStore.getToken) {
  // notify user that he is already logged in
  //console.log('the user ================== ', appStore?.getUser?.eth_address);

  notification.value = {
    status: 'success',
    message: 'You are already logged in. Redirecting to home page...',
  };
  // timeout before redirection
  // setTimeout(() => {
  //   router.push('/');
  // }, 5000);
}
</script>
