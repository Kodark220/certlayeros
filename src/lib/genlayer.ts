import { createClient, createAccount } from "genlayer-js";
import { TransactionStatus, CalldataAddress } from "genlayer-js/types";
import { testnetBradbury } from "genlayer-js/chains";
import { CONTRACT_ADDRESS } from "./contract";

let clientInstance: ReturnType<typeof createClient> | null = null;
let currentPrivateKey: string | null = null;

export function toCalldataAddress(hexStr: string): CalldataAddress {
  const hex = hexStr.replace("0x", "");
  return new CalldataAddress(
    new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  );
}

export function setAuthAccount(privateKey: string) {
  if (privateKey !== currentPrivateKey) {
    currentPrivateKey = privateKey;
    clientInstance = null;
  }
}

export function clearAuthAccount() {
  currentPrivateKey = null;
  clientInstance = null;
}

export function getClient() {
  if (!clientInstance) {
    const account = currentPrivateKey
      ? createAccount(currentPrivateKey as `0x${string}`)
      : createAccount();
    clientInstance = createClient({
      chain: testnetBradbury,
      account,
    });
  }
  return clientInstance;
}

export async function readContract(functionName: string, args: any[] = []) {
  const client = getClient();
  return client.readContract({
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
  const client = getClient();
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName,
    args,
    value: BigInt(value),
  } as any);
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
  });
  return { hash, receipt };
}
