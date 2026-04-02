export type NetworkId = "bradbury" | "studionet";

export interface NetworkConfig {
  id: NetworkId;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
  contractAddress: string;
  deployerAddress: string;
  /** The key used by client.connect() */
  sdkChainKey: string;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  bradbury: {
    id: "bradbury",
    name: "Bradbury Testnet",
    chainId: 4221,
    rpcUrl: "https://rpc-bradbury.genlayer.com",
    explorer: "https://explorer-bradbury.genlayer.com",
    contractAddress: "0xd734d92088F99E7C4985E9E16dA5EABf1353739C",
    deployerAddress: "0xf9346827f713eb953a2e22465b9ee91901726bdc",
    sdkChainKey: "testnetBradbury",
  },
  studionet: {
    id: "studionet",
    name: "Studio Network",
    chainId: 61999,
    rpcUrl: "https://studio.genlayer.com/api",
    explorer: "https://genlayer-explorer.vercel.app",
    contractAddress: "0x51213C8e9d4238798601074FE1371a0fA61586A1",
    deployerAddress: "0xf9346827f713eb953a2e22465b9ee91901726bdc",
    sdkChainKey: "studionet",
  },
};

export const DEFAULT_NETWORK: NetworkId = "studionet";

export const PROMISE_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Active", color: "text-blue-400" },
  1: { label: "Kept", color: "text-emerald-400" },
  2: { label: "Broken", color: "text-red-400" },
};
