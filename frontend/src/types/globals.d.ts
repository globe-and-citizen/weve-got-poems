// src/types/ethereum.d.ts or wherever you prefer to keep your type definitions

interface EthereumProvider {
  isMetaMask?: boolean;
  // Define other properties and methods you use from the Ethereum provider
  request: (request: { method: string; params?: Array<any> }) => Promise<any>;
}

interface Window {
  ethereum?: EthereumProvider;
}
