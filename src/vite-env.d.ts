/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_DEPLOYER_ADDRESS: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_EXPLORER_URL: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_NETWORK_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
