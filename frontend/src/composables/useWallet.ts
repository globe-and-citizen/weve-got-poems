import { BrowserProvider, ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import type { Ref } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Interface for the useWallet composable
export interface WalletType {
  /**
   * This function connects the user's MetaMask wallet to the app.
   */
  connectWallet: () => Promise<void>;
  /**
   * This variable is true if the user is connected to MetaMask.
   */
  isConnected: Ref<boolean>;

  /**
   * This variable is the provider that is used to connect to MetaMask.
   */
  provider: BrowserProvider | undefined;
  /**
   * This function signs the message and send it to the backend.
   */
  signInWithEthereum: () => Promise<string | undefined>;

  /**
   * Initializes sending Ether by checking the wallet connection and proceeding with the transaction.
   */
  initiateSendEther(
    recipientAddress: string,
    amountInEther: string,
  ): Promise<
    | {
        transactionId: any;
        blockNumber: any;
        networkName: any;
        success: boolean;
      }
    | undefined
  >;

  /**
   * Retrieves details for a specific Ethereum transaction.
   */
  getTransactionDetails(txHash: string,networkName:string): Promise<
    | {
        amount: string;
        sender: string;
        receiver: string | null;
        status: string;
      }
    | null
    | undefined
  >;
  /**
   * This variable is the signer that is used to sign the message.
   */
  signer: any;
  /**
   * This variable is the user's address.
   */
  userAddress: any;
}

export function useWallet(): WalletType {
  const userAddress = ref();
  const isConnected = ref(false);
  let provider: BrowserProvider | undefined;
  let signer: any;
  const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
  let intervalId: string | number | NodeJS.Timeout | undefined;

  /**
   * This function connects the user's MetaMask wallet to the app.
   * It uses the window.ethereum.request method to connect the wallet.
   */
  async function connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
      }

      const { ethereum } = window;
      if (!ethereum) {
        alert('Please install MetaMask to use this feature');
      }
      provider = new BrowserProvider(window.ethereum!);
      await checkNetwork();
      if (provider) {
        signer = await provider.getSigner();
        userAddress.value = await signer.getAddress();
      }
    } catch (error) {
      console.log('Error: ', error);
    }
    // return { provider, signer }
  }

  async function checkNetwork() {
    if (provider) {
      const networkId = await provider.getNetwork();
      console.log('the chainID ', networkId.chainId);
      if (networkId.chainId != import.meta.env.VITE_CURRENT_NETWORK_ID) {
        alert(
          ` please make sure you're connected to  ${
            import.meta.env.VITE_CURRENT_NETWORK_NAME
          }`,
        );
        throw new Error(
          " please make sure you're connected to sepolia network",
        );
      }
    }
  }

  // TODO: make this function receiving the nonce instead of fetching it
  /*
       WHY: SOLID principle :
       - Single Responsibility Principle: A function should have one and only one reason to change, meaning that a function should have only one job.
       And here if the API change the function need to be changed. This is not good
       */
  async function createSiweMessage(address: string, statement: string) {
    const domain = window.location.host;
    const origin = window.location.origin;

    // TODO: remove this ts-ignore
    //console.log('the layer8 ========= ', layer8)
    //const res = await fetch(`${endpoint}/nonce`)
    //const nonce = await res.text()
    //console.log('' + nonce)

    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId: import.meta.env.VITE_CURRENT_NETWORK_ID,
      //nonce: nonce
    });
    return message.prepareMessage();
  }
  //   async function createSiweMessage(address: string, statement: string) {
  //     const requiredChainId = 11155111;  // Example for Ethereum Mainnet
  //     const currentChainId = await getCurrentChainId();

  //     if (currentChainId !== requiredChainId) {
  //         throw new Error(`Please switch to Sepolia network `);
  //     }

  //     const domain = window.location.host;
  //     const origin = window.location.origin;

  //     const message = new SiweMessage({
  //         domain,
  //         address,
  //         statement,
  //         uri: origin,
  //         version: '1',
  //         chainId: requiredChainId,  // Use the validated chainId
  //     });

  //     return message.prepareMessage();
  // }

  // TODO : make this function only sign the message and not send it to the backend
  // TODO : Create a function that verify the signature by calling the backend and receiving a the signature
  async function signInWithEthereum() {
    // Connect the wallet if it is not connected

    let value;
    try {
      if (!isConnected.value) {
        console.log('the user is connected ==================');
        await connectWallet();
      }
      // Check if we have the signer and the provider
      if (!signer || !provider) {
        throw new Error('No signer or provider');
      }
      // Create the message
      const message = await createSiweMessage(
        userAddress.value,
        'Sign in with Ethereum to the app.',
      );
      // Sign the message
      const signature = await signer.signMessage(message);

      // Send the signature to the backend
      const res = await fetch(`${endpoint}/siwe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature, message }),
      });

      if (!res.ok) {
        console.error(`Failed in getInformation: ${res.statusText}`);
        return;
      }
      const { token } = await res.json();
      value = token;
    } catch (e) {
      console.log('here', e);
    }
    return value;
  }

  async function sendEther(
    recipientAddress: string,
    amountInEther: string,
    networkName: string,
  ) {
    //initate transaction..
    const transaction = {
      to: ethers.getAddress(recipientAddress),
      value: ethers.parseEther(amountInEther),
    };
    try {
      const txResponse = await signer.sendTransaction(transaction);
      const txReceipt = await txResponse.wait();
      console.log('txReceipt ============ ', txReceipt);
      return {
        transactionId: txReceipt.hash,
        blockNumber: txReceipt.blockNumber,
        networkName: networkName,
        success: txReceipt.status === 1,
      };
    } catch (error) {
      throw new Error(`error when sending transaction: ${error}`);
    }
  }

  // Example usage:
  async function initiateSendEther(
    recipientAddress: string,
    amountInEther: string,
  ) {
    let value;
    console.log('initiate transaction called ================= ')
    try {
      if (!isConnected.value) {
        await connectWallet();
      }
      // Check if we have the signer and the provider
      if (!signer || !provider) {
        throw new Error('No signer or provider');
      }
      //let's check the network id
      const network = await provider.getNetwork();
      //console.log('the network id ', await provider.getNetwork());
      //11155111
      if (signer) {
        const transactionResult = await sendEther(
          recipientAddress,
          amountInEther,
          network?.name,
        );
        return transactionResult;
        // Further logic to handle successful transaction
      }
    } catch (error) {
      throw new Error(` ${error}`);
    }
  }

  async function getTransactionDetails(txHash: string,networkName:string) {
    console.log('the transaction hash ========== ', txHash);
    let currentProviderUrl = import.meta.env
      .VITE_ALCHEMY_POLYGON_AMOY_PROVIDER_URL;
    if (networkName.includes('sepolia')) {
      currentProviderUrl = import.meta.env.VITE_ALCHEMY_SEPOLIA_PROVIDER_URL;
    }
   

    const currentProvider = new ethers.JsonRpcProvider(currentProviderUrl);
    try {
      // Fetch the transaction details
      const transaction = await currentProvider.getTransaction(txHash);
      // Fetch the transaction receipt to get the status
      const receipt = await currentProvider.getTransactionReceipt(txHash);
      let result = null;
      if (transaction) {
        // Extracting the desired information
        const amount = ethers.formatEther(transaction?.value); // Convert Wei to Ether for the transaction amount
        const sender = transaction.from;
        const receiver = transaction.to;
        const status = receipt?.status === 1 ? 'Success' : 'Failed';

        result = {
          amount: amount,
          sender: sender,
          receiver: receiver,
          status: status,
        };
      }

      return result;
    } catch (error) {
      console.error('Error retrieving transaction details:', error);
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
      provider = new BrowserProvider(window.ethereum);
    }
    intervalId = setInterval(async () => {
      try {
        if (window.ethereum && provider) {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          isConnected.value = accounts.length > 0;
          userAddress.value = accounts.pop();
          if (isConnected.value) {
            // This throws an error if the user is not connected
            signer = await provider.getSigner();
            userAddress.value = await signer.getAddress();
          } else {
            signer = undefined;
          }
        } else {
          isConnected.value = false;
        }
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  });

  /**
   * This is a Vue lifecycle hook that is called when the component is unmounted.
   * We use it to clear the interval that we set up in the onMounted hook.
   */
  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
  });
  return {
    connectWallet,
    isConnected,
    provider,
    signInWithEthereum,
    signer,
    userAddress,
    initiateSendEther,
    getTransactionDetails,
  };
}
