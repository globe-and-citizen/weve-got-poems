<template>
  <q-layout view="lHh Lpr lFf" class="body w-full">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="">
          <q-btn
            v-if="!leftDrawerOpen"
            flat
            dense
            round
            @click="toggleLeftDrawer"
            aria-label="Menu"
            icon="menu" />

          We've Got poems <q-icon name="mail" class="text-h5 text-warning"
        /></q-toolbar-title>

        <q-space />

        <span class="text-right text-white">
          <q-icon name="wallet" class="q-mr-sm text-h5 text-warning" />
          <span>{{ 'Wallet Address : ' }}</span>
          <span class="text-caption">
            <q-icon
              :name="showWalletAddress ? 'visibility' : 'visibility_off'"
              @click="toggleWalletAddress"
              class="cursor-pointer q-ml-sm text-h5 q-mr-sm text-warning "
            />
            <span v-if="showWalletAddress">{{
              appStore?.getUser?.eth_address
            }}</span>
            <span v-else></span>
          </span>
        </span>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-primary q-pa-md"
    >
      <q-btn
        flat
        dense
        round
        @click="toggleLeftDrawer"
        aria-label="Menu"
        icon="menu"
        color="white"
      />
      <q-list>
        <!-- Navigation Links -->
        <q-item class="text-white" clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item class="text-white" clickable v-ripple to="/login">
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section> Login </q-item-section>
        </q-item>
        <q-expansion-item
          class="text-white"
          icon="library_books"
          label="Transactions"
        >
          <q-item
            class="q-ml-xl"
            clickable
            v-ripple
            to="/ctransactions/admin/list"
          >
            <q-item-section avatar>
              <q-icon name="auto_stories" />
            </q-item-section>
            <q-item-section> List </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-expansion-item class="text-white" icon="library_books" label="Poems">
          <q-item class="q-ml-xl" clickable v-ripple to="/poems/create">
            <q-item-section avatar>
              <q-icon name="add_circle_outline" />
            </q-item-section>
            <q-item-section> Create </q-item-section>
          </q-item>
          <q-item
            class="q-ml-xl"
            clickable
            v-ripple
            to="/poems"
            data-text="poems_list"
          >
            <q-item-section avatar>
              <q-icon name="auto_stories" />
            </q-item-section>
            <q-item-section> List </q-item-section>
          </q-item>
          <q-item class="q-ml-xl" clickable v-ripple to="/poems/admin/list">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section> Admin</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAppStore } from 'src/stores/app';
import { ref } from 'vue';
export default {
  name: 'MyLayout',

  setup() {
    const appStore = useAppStore();
    const leftDrawerOpen = ref(false);
    const showWalletAddress = ref(false);

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function toggleWalletAddress() {
      showWalletAddress.value = !showWalletAddress.value;
    }

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      showWalletAddress,
      toggleWalletAddress,
      appStore,
    };
  },
};
</script>

<style>
.body {
  background-image: url(../boot/img/letter.jpg);
  background-position: right;
  object-fit: cover;
  background-repeat: no-repeat;
}
</style>
