// import { BrowserProvider } from 'ethers'
// import { defineStore } from 'pinia'
// import { generateNonce, SiweMessage } from 'siwe'
// import { useFetch } from '@/composables/useFetch'
//
// const provider = new BrowserProvider(window.ethereum)
// const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT
//
// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     _address: null,
//     _isLoading: false,
//     _message: null,
//     _signature: null,
//     _wallets: null
//   }),
//
//   getters: {
//     address: (state) => state._address,
//     isLoading: (state) => state._isLoading,
//     message: (state) => state._message,
//     signature: (state) => state._signature,
//     wallets: (state) => state._wallets
//   },
//
//   actions: {
//
//     connectWallet() {
//       provider
//         .send('eth_requestAccounts', [])
//         .then((res) => (this._wallets = res))
//         // .then(() => Notify.create({ message: 'Wallet connected', type: 'positive' }))
//         .catch(() => console.log('user rejected request'))
//     },
//
//     async createSiweMessage(address: string) {
//
//       const { error, data } = useFetch (`${endpoint}/nonce`, {
//         credentials: 'include',
//       })
//       // Fetch the From the API
//       const nonce = generateNonce()
//
//       const message = new SiweMessage({
//         domain: window.location.host,
//         address: address,
//         statement: 'Sign in with Ethereum to the app.',
//         uri: window.location.origin,
//         version: '1',
//         chainId: 1,
//         nonce: data.value,
//       })
//
//       return message.prepareMessage()
//     },
//
//     async signInWithEthereum() {
//       this._isLoading = true
//       try {
//         const signer = await provider.getSigner()
//
//         this._address = signer.address
//
//         this._message = await this.createSiweMessage(this._address)
//
//         this._signature = await signer.signMessage(this._message)
//
//         // Notify.create({ message: 'Successfully signed in with Ethereum', type: 'positive' })
//       } catch (error) {
//
//         // errorStore.throwError(error, 'Error signing in with Ethereum')
//       } finally {
//         this._isLoading = false
//       }
//     }
//   }
// })