import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BrowserProvider } from 'ethers'
import { SiweMessage } from 'siwe'

// Interface for the useWallet composable
export interface WalletType {
    /**
     * This function connects the user's MetaMask wallet to the app.
     */
    connectWallet: () => Promise<void>
    /**
     * This variable is true if the user is connected to MetaMask.
     */
    isConnected: Ref<boolean>

    /**
     * This variable is the provider that is used to connect to MetaMask.
     */
    provider: BrowserProvider | undefined
    /**
     * This function signs the message and send it to the backend.
     */
    signInWithEthereum: () => Promise<string | undefined>

    /**
     * This variable is the signer that is used to sign the message.
     */
    signer: any
    /**
     * This variable is the user's address.
     */
    userAddress: any
}

export function useWallet(): WalletType {
    const userAddress = ref()
    const isConnected = ref(false)
    let provider: BrowserProvider | undefined
    let signer: any
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
                signer = await provider.getSigner()
                userAddress.value = await signer.getAddress()
            }
        } catch (error) {
            console.log('Error: ', error)
        }
        // return { provider, signer }
    }

    // TODO: make this function receiving the nonce instead of fetching it
    /*
     WHY: SOLID principle :
     - Single Responsibility Principle: A function should have one and only one reason to change, meaning that a function should have only one job.
     And here if the API change the function need to be changed. This is not good
     */
    async function createSiweMessage(address: string, statement: string) {

        const domain = window.location.host
        const origin = window.location.origin
        const res = await fetch(`${endpoint}/nonce`)
        const message = new SiweMessage({
            domain,
            address,
            statement,
            uri: origin,
            version: '1',
            chainId: 1,
            nonce: await res.text()
        })
        return message.prepareMessage()
    }

    // TODO : make this function only sign the message and not send it to the backend
    // TODO : Create a function that verify the signature by calling the backend and receiving a the signature
    async function signInWithEthereum() {
        // Connect the wallet if it is not connected
        let value
        try {
            if (!isConnected.value) {
                await connectWallet()
            }
            // Check if we have the signer and the provider
            if (!signer || !provider) {
                throw new Error('No signer or provider')
            }
            // Create the message
            const message = await createSiweMessage(userAddress.value, 'Sign in with Ethereum to the app.')
            // Sign the message
            const signature = await signer.signMessage(message)
            // Send the signature to the backend
            const res = await fetch(`${endpoint}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ signature, message })
            })

            if (!res.ok) {
                console.error(`Failed in getInformation: ${res.statusText}`)
                return
            }
            const { token } = await res.json()
            value = token
        } catch (e) {
            console.log('here', e)
        }
        return value
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
                        signer = await provider.getSigner()
                        userAddress.value = await signer.getAddress()
                    } else {
                        signer = undefined
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
    return { connectWallet, isConnected, provider, signInWithEthereum, signer, userAddress }
}
