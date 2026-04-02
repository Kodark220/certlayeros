import { createClient } from "genlayer-js";
import { TransactionStatus, CalldataAddress } from "genlayer-js/types";
import { testnetBradbury, studionet } from "genlayer-js/chains";
import { NETWORKS, DEFAULT_NETWORK, type NetworkId } from "./contract";

const CHAIN_MAP = {
  bradbury: testnetBradbury,
  studionet: studionet,
} as const;

// ── State ──
let activeNetworkId: NetworkId = (() => {
  try {
    const stored = localStorage.getItem("certlayer_network");
    if (stored && stored in NETWORKS) return stored as NetworkId;
  } catch {}
  return DEFAULT_NETWORK;
})();

let readClientInstance = createClient({ chain: CHAIN_MAP[activeNetworkId] });
let writeClientInstance: ReturnType<typeof createClient> | null = null;
let currentWalletAddress: string | null = null;

// ── Helpers ──

export function toCalldataAddress(hexStr: string): CalldataAddress {
  const hex = hexStr.replace("0x", "");
  return new CalldataAddress(
    new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  );
}

function getContractAddress(): `0x${string}` {
  return NETWORKS[activeNetworkId].contractAddress as `0x${string}`;
}

// ── Network switching ──

export function switchNetwork(id: NetworkId) {
  activeNetworkId = id;
  readClientInstance = createClient({ chain: CHAIN_MAP[id] });
  // Rebuild write client if wallet is connected
  if (currentWalletAddress) {
    const eth = (window as any).ethereum;
    if (eth) {
      writeClientInstance = createClient({
        chain: CHAIN_MAP[id],
        account: currentWalletAddress as `0x${string}`,
        provider: eth,
      });
    }
  }
}

// ── Wallet provider ──

export function setWalletProvider(address: string) {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet provider found");
  if (address !== currentWalletAddress) {
    currentWalletAddress = address;
    writeClientInstance = createClient({
      chain: CHAIN_MAP[activeNetworkId],
      account: address as `0x${string}`,
      provider: eth,
    });
  }
}

export function clearWalletProvider() {
  currentWalletAddress = null;
  writeClientInstance = null;
}

export async function connectWalletToChain() {
  if (writeClientInstance) {
    await writeClientInstance.connect(NETWORKS[activeNetworkId].sdkChainKey as any);
  }
}

// ── Contract calls ──

export async function readContract(functionName: string, args: any[] = []) {
  return readClientInstance.readContract({
    address: getContractAddress(),
    functionName,
    args,
  } as any);
}

export async function writeContract(
  functionName: string,
  args: any[] = [],
  value: number = 0
) {
  if (!writeClientInstance) throw new Error("Wallet not connected");
  const hash = await writeClientInstance.writeContract({
    address: getContractAddress(),
    functionName,
    args,
    value: BigInt(value),
  } as any);
  const receipt = await readClientInstance.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
  });
  return { hash, receipt };
}
