<template>
  <div class="q-pa-md row items-start q-gutter-md justify-center">
    <div class="col-12 col-md-6 col-lg-4">
      <q-card class="my-card">
        <q-card-section class="text-center bg-primary q-mx-auto q-my-auto">
          <div class="text-h6 q-mb-sm text-white">Profile</div>
          <div class="text-subtitle2 q-mb-md text-white">
            Sign in with your Sepolia account
          </div>

          <div v-if="walletAddress" class="q-mb-md">
            <q-form class="q-gutter-md">
              <q-input
                bg-color="white"
                filled
                readonly
                v-model="walletAddress"
                label="Your wallet address *"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
              <div class="center-button">
                <q-btn
                  data-test="sign-button"
                  @click.prevent="onLogout()"
                  color="negative"
                  class="full-width"
                >
                  <q-icon name="logout" class="q-mr-sm" />
                  Logout
                </q-btn>
              </div>
            </q-form>
          </div>

          <q-btn
            v-if="!walletAddress"
            @click.prevent="onSignIn()"
            color="positive"
            class="full-width"
          >
            <q-icon name="login" class="q-mr-sm" />
            Sign in
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
<style scoped>
.body {
  background-image: url(./img/letter.jpg);
}

.white-label .q-field__label {
  color: white;
}

.center-button {
  display: flex;
  justify-content: center;
}

</style>
