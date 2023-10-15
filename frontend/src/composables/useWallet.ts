import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BrowserProvider } from 'ethers'

export function useWallet() {
    const userAddress = ref()
    const isConnected = ref(false)
    // const provider: Ref<BrowserProvider | undefined> = ref()
    let provider: BrowserProvider | undefined
    const signer = ref()
    const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT
    let intervalId: string | number | NodeJS.Timeout | undefined

    async function connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                console.log('MetaMask is installed!')
            }

            const { ethereum } = window
            if (!ethereum) {
                alert('Please install MetaMask to use this feature')
            }
            provider = new BrowserProvider(window.ethereum)
            if (provider) {
                console.log('1')
                signer.value = await provider.getSigner()
                console.log('2')
            }
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            })
            userAddress.value = accounts.pop()
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    onMounted(async () => {
        if (window.ethereum) {
            provider = new BrowserProvider(window.ethereum)
        }
        intervalId = setInterval(async () => {
            try {
                if (window.ethereum && provider) {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                    isConnected.value = accounts.length > 0
                    userAddress.value = accounts.pop()
                    if (isConnected.value) {
                        // This throws an error if the user is not connected
                        signer.value = await provider.getSigner()
                    } else {
                        signer.value = undefined
                    }
                } else {
                    isConnected.value = false
                }
            } catch (e) {
                console.log(e)
            }
        }, 1000)
    })
    onBeforeUnmount(() => {
        if (intervalId) clearInterval(intervalId)
    })
    return { userAddress, isConnected, connectWallet, signer, provider }
}
