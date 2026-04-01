import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createAccount } from "genlayer-js";
import { setAuthAccount, clearAuthAccount } from "@/lib/genlayer";

export interface AuthUser {
  /** GenLayer address (derived from signature) */
  address: string;
  /** MetaMask address (display identity) */
  walletAddress: string;
  /** GenLayer private key (in-memory only, never stored) */
  privateKey: string;
  chosenRole?: "protocol" | "watcher";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  setChosenRole: (role: "protocol" | "watcher") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "certlayer_session";
const SIGN_MESSAGE = "Sign in to CertLayer\n\nThis signature is used to derive your CertLayer account. It does not trigger a transaction or cost any gas.";

/** Derive a deterministic GenLayer private key from a MetaMask signature. */
async function derivePrivateKey(signature: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(signature);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface StoredSession {
  walletAddress: string;
  chosenRole?: "protocol" | "watcher";
}

function saveSession(session: StoredSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Provider ───

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if MetaMask is still connected from a previous session
  useEffect(() => {
    async function tryReconnect() {
      const session = loadSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const eth = (window as any).ethereum;
      if (!eth) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        // Check if MetaMask still has this account connected (no popup)
        const accounts: string[] = await eth.request({ method: "eth_accounts" });
        const connected = accounts.find(
          (a: string) => a.toLowerCase() === session.walletAddress.toLowerCase()
        );
        if (!connected) {
          clearSession();
          setLoading(false);
          return;
        }

        // Re-derive key by asking user to sign again
        const signature: string = await eth.request({
          method: "personal_sign",
          params: [SIGN_MESSAGE, connected],
        });
        const pk = await derivePrivateKey(signature);
        const account = createAccount(pk as `0x${string}`);

        const u: AuthUser = {
          address: account.address,
          walletAddress: connected.toLowerCase(),
          privateKey: pk,
          chosenRole: session.chosenRole,
        };
        setUser(u);
        setAuthAccount(pk);
      } catch {
        // User rejected sign or MetaMask error — clear session
        clearSession();
      }
      setLoading(false);
    }

    tryReconnect();
  }, []);

  // Listen for MetaMask account changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    function handleAccountsChanged(accounts: string[]) {
      if (!accounts.length) {
        // User disconnected
        setUser(null);
        clearAuthAccount();
        clearSession();
      }
    }

    eth.on("accountsChanged", handleAccountsChanged);
    return () => eth.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  async function connectWallet() {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not detected. Please install MetaMask.");

    // Request account access (shows MetaMask popup if not already connected)
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts.length) throw new Error("No accounts returned from MetaMask");
    const walletAddr = accounts[0].toLowerCase();

    // Ask user to sign a message (derives their unique GenLayer key)
    const signature: string = await eth.request({
      method: "personal_sign",
      params: [SIGN_MESSAGE, accounts[0]],
    });

    const pk = await derivePrivateKey(signature);
    const account = createAccount(pk as `0x${string}`);

    const u: AuthUser = {
      address: account.address,
      walletAddress: walletAddr,
      privateKey: pk,
    };
    setUser(u);
    setAuthAccount(pk);
    saveSession({ walletAddress: walletAddr });
  }

  function logout() {
    setUser(null);
    clearAuthAccount();
    clearSession();
  }

  function setChosenRole(role: "protocol" | "watcher") {
    if (!user) return;
    const updated = { ...user, chosenRole: role };
    setUser(updated);
    const session = loadSession();
    if (session) {
      session.chosenRole = role;
      saveSession(session);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        connectWallet,
        setChosenRole,
        logout,
      }}
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
