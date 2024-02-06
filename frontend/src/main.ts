import './assets/main.css'
//@ts-ignore
//lobalThis.BACKEND = 'localhost:8000'

//@ts-ignore
//import * as interceptor from 'http://localhost:5001/assets-v1/cdn/interceptor/index.local.js'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

//@ts-ignore
import layer8_interceptor from 'layer8_interceptor'
//console.log('interceptor', interceptor)
console.log('Frontend: main.ts init Encrypted tunel')

layer8_interceptor.initEncryptedTunnel({
  SP_Backend: 'api-wevegotpoems.up.railway.app/',
  Layer8Scheme: 'https',
  //Layer8Host: 'aws-container-service-t1.gej3a3qi2as1a.ca-central-1.cs.amazonlightsail.com',
  Layer8Host: 'layer8devproxy.net',
  Layer8Port: ''
})

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
