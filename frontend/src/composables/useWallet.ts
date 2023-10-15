import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BrowserProvider } from 'ethers'

export function useWallet() {
    const userAddress = ref()
    const isConnected = ref(false)
    let provider: BrowserProvider | undefined
    const signer = ref()
    const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT
    let intervalId: string | number | NodeJS.Timeout | undefined

    /**
     * This function connects the user's MetaMask wallet to the app.
     * It uses the window.ethereum.request method to connect the wallet.
     */
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
                signer.value = await provider.getSigner()
                userAddress.value = await signer.value.getAddress()
            }
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    /**
     * This is a Vue lifecycle hook that is called when the component is mounted.
     * We use it to check if the user is connected to MetaMask.
     * If they are, we set the userAddress and isConnected variables.
     * We also set up a setInterval to check if the user is still connected.
     * If they are not, we set the userAddress and isConnected variables to their default values.
     */
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
                        userAddress.value = await signer.value.getAddress()
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

    /**
     * This is a Vue lifecycle hook that is called when the component is unmounted.
     * We use it to clear the interval that we set up in the onMounted hook.
     */
    onBeforeUnmount(() => {
        if (intervalId) clearInterval(intervalId)
    })
    return { userAddress, isConnected, connectWallet, signer, provider }
}
