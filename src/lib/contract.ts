export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xd734d92088F99E7C4985E9E16dA5EABf1353739C";

export const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || "0xf9346827f713eb953a2e22465b9ee91901726bdc";

export const NETWORK = {
  name: import.meta.env.VITE_NETWORK_NAME || "Bradbury Testnet",
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 4221),
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://rpc-bradbury.genlayer.com",
  explorer: import.meta.env.VITE_EXPLORER_URL || "https://explorer-bradbury.genlayer.com",
};

export const PROMISE_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Active", color: "text-blue-400" },
  1: { label: "Kept", color: "text-emerald-400" },
  2: { label: "Broken", color: "text-red-400" },
};
