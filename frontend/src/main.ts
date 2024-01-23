import './assets/main.css'
//@ts-ignore
globalThis.BACKEND = 'localhost:8000'

//@ts-ignore
import * as interceptor from 'http://localhost:5001/assets-v1/cdn/interceptor/index.local.js'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

console.log('interceptor', interceptor)

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
