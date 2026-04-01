import { createClient } from "genlayer-js";
import { TransactionStatus, CalldataAddress } from "genlayer-js/types";
import { testnetBradbury } from "genlayer-js/chains";
import { CONTRACT_ADDRESS } from "./contract";

// Read client — no wallet needed, talks directly to RPC
const readClientInstance = createClient({ chain: testnetBradbury });

// Write client — signs through the wallet provider (MetaMask)
let writeClientInstance: ReturnType<typeof createClient> | null = null;
let currentWalletAddress: string | null = null;

export function toCalldataAddress(hexStr: string): CalldataAddress {
  const hex = hexStr.replace("0x", "");
  return new CalldataAddress(
    new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  );
}

/** Set up the write client using the connected wallet address + provider */
export function setWalletProvider(address: string) {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet provider found");
  if (address !== currentWalletAddress) {
    currentWalletAddress = address;
    writeClientInstance = createClient({
      chain: testnetBradbury,
      account: address as `0x${string}`,
      provider: eth,
    });
  }
}

export function clearWalletProvider() {
  currentWalletAddress = null;
  writeClientInstance = null;
}

/** Switch the wallet to the GenLayer Bradbury testnet */
export async function connectWalletToChain() {
  if (writeClientInstance) {
    await writeClientInstance.connect("testnetBradbury");
  }
}

export async function readContract(functionName: string, args: any[] = []) {
  return readClientInstance.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
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
    address: CONTRACT_ADDRESS as `0x${string}`,
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
