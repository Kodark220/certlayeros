import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createAccount, generatePrivateKey } from "genlayer-js";
import { setAuthAccount, clearAuthAccount } from "@/lib/genlayer";

export type LoginMethod = "email" | "wallet" | "metamask";

export interface AuthUser {
  address: string;
  loginMethod: LoginMethod;
  email?: string;
  privateKey: string;
  walletName?: string;
  externalAddress?: string; // e.g. MetaMask address
  chosenRole?: "protocol" | "watcher";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginWithEmail: (email: string) => void;
  loginWithWallet: (privateKey?: string) => void;
  loginWithMetaMask: () => Promise<void>;
  setChosenRole: (role: "protocol" | "watcher") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "certlayer_auth";
const WALLETS_KEY = "certlayer_wallets";

function getStoredWallets(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(WALLETS_KEY) || "{}");
  } catch {
    return {};
  }
}

function storeWallet(email: string, privateKey: string) {
  const wallets = getStoredWallets();
  wallets[email.toLowerCase()] = privateKey;
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
}

function getOrCreateWalletForEmail(email: string): string {
  const wallets = getStoredWallets();
  const key = email.toLowerCase();
  if (wallets[key]) return wallets[key];
  const pk = generatePrivateKey();
  storeWallet(key, pk);
  return pk;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        setAuthAccount(parsed.privateKey);
      }
    } catch {}
    setLoading(false);
  }, []);

  function persist(u: AuthUser) {
    setUser(u);
    setAuthAccount(u.privateKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  function loginWithEmail(email: string) {
    const pk = getOrCreateWalletForEmail(email);
    const account = createAccount(pk as `0x${string}`);
    persist({
      address: account.address,
      loginMethod: "email",
      email,
      privateKey: pk,
    });
  }

  function loginWithWallet(privateKey?: string) {
    const pk = privateKey || generatePrivateKey();
    const account = createAccount(pk as `0x${string}`);
    persist({
      address: account.address,
      loginMethod: "wallet",
      privateKey: pk,
      walletName: privateKey ? "Imported Wallet" : "Generated Wallet",
    });
  }

  async function loginWithMetaMask() {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not detected");
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts.length) throw new Error("No accounts returned");
    // Derive a deterministic GenLayer key from the MetaMask address
    const mmAddr = accounts[0].toLowerCase();
    const wallets = getStoredWallets();
    const storeKey = `mm_${mmAddr}`;
    let pk = wallets[storeKey];
    if (!pk) {
      pk = generatePrivateKey();
      wallets[storeKey] = pk;
      localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
    }
    const account = createAccount(pk as `0x${string}`);
    persist({
      address: account.address,
      loginMethod: "metamask",
      privateKey: pk,
      walletName: "MetaMask",
      externalAddress: mmAddr,
    });
  }

  function logout() {
    setUser(null);
    clearAuthAccount();
    localStorage.removeItem(STORAGE_KEY);
  }

  function setChosenRole(role: "protocol" | "watcher") {
    if (!user) return;
    const updated = { ...user, chosenRole: role };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithEmail, loginWithWallet, loginWithMetaMask, setChosenRole, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
