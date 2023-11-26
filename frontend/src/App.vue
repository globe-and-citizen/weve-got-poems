<script setup lang='ts'>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
function shortenEthereumAddress(address: string) {
  if (address.length < 8) {
    return address; // Address is too short to shorten.
  }

  const prefix = address.slice(0, 6);
  const suffix = address.slice(-4);

  return `${prefix}...${suffix}`;
}
</script>

<template>
  <header>
    <img alt='Vue logo' class='logo' src='@/assets/logo.svg' width='125' height='125' />

    <div>
      <HelloWorld msg='Poems, Poems, Everywhere; Very, very, soon!' />
      <p v-if='appStore.getToken' class='text-right text-xl'>Welcome {{ shortenEthereumAddress(appStore.getUser.eth_address)}}</p>
      <nav>
        <RouterLink to='/'>Home</RouterLink>
        <RouterLink to='/poems/create' v-if='appStore.getToken'>Create Poem</RouterLink>
        <RouterLink to='/login' v-if='!appStore.getToken'>Login</RouterLink>
        <RouterLink to='/account' v-if='appStore.getToken'>My Account</RouterLink>
        <a  v-if='appStore.getToken' @click.prevent='appStore.setToken("")'>Logout</a>

      </nav>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
header {
    width: 100%;
    line-height: 1.5;
    max-height: 100vh;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

nav {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    font-size: 12px;
    text-align: center;
    margin-top: 2rem;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        justify-content: space-between;
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    nav {
        text-align: left;
        margin-left: -1rem;
        font-size: 1rem;

        padding: 1rem 0;
        margin-top: 1rem;
    }
}
</style>
