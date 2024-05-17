<template>
  <q-layout view="lHh Lpr lFf" class="bg-white">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
        />
        <q-toolbar-title> We've Got poem </q-toolbar-title>
        <q-space />

        <span class="text-right text-white">
          <span>{{ 'Wallet Address : ' }}</span>
          <span class="text-caption">
            {{ appStore?.getUser?.eth_address }}
          </span>
        </span>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <!-- Navigation Links -->
        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section> Home </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/login">
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section> Login </q-item-section>
        </q-item>
        <q-expansion-item icon="library_books" label="Transactions">
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
        <q-expansion-item icon="library_books" label="Poems">
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

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    console.log('the mainlayout user ================ ', appStore?.getUser);

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      appStore,
    };
  },
};
</script>
