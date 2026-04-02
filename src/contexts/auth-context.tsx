import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setWalletProvider, clearWalletProvider, connectWalletToChain } from "@/lib/genlayer";

export interface AuthUser {
  /** The wallet address — same address used on-chain as msg.sender */
  address: string;
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

interface StoredSession {
  address: string;
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

  // On mount, check if wallet is still connected from a previous session
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
        // Check if wallet still has this account connected (no popup)
        const accounts: string[] = await eth.request({ method: "eth_accounts" });
        const connected = accounts.find(
          (a: string) => a.toLowerCase() === session.address.toLowerCase()
        );
        if (!connected) {
          clearSession();
          setLoading(false);
          return;
        }

        // Set up write client with the connected wallet
        setWalletProvider(connected.toLowerCase());

        setUser({
          address: connected.toLowerCase(),
          chosenRole: session.chosenRole,
        });
      } catch {
        clearSession();
      }
      setLoading(false);
    }

    tryReconnect();
  }, []);

  // Listen for wallet account changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    function handleAccountsChanged(accounts: string[]) {
      if (!accounts.length) {
        // User disconnected
        setUser(null);
        clearWalletProvider();
        clearSession();
      } else {
        // User switched to a different account — re-auth with new address
        const newAddr = accounts[0].toLowerCase();
        setWalletProvider(newAddr);
        setUser({ address: newAddr });
        saveSession({ address: newAddr });
      }
    }

    eth.on("accountsChanged", handleAccountsChanged);
    return () => eth.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  async function connectWallet() {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not detected. Please install MetaMask.");

    // Request account access (shows popup if not already connected)
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts.length) throw new Error("No accounts returned from wallet");
    const addr = accounts[0].toLowerCase();

    // Set up the write client with the wallet provider
    setWalletProvider(addr);

    // Switch the wallet to GenLayer Bradbury testnet
    try {
      await connectWalletToChain();
    } catch {
      // Non-fatal — user may reject the chain switch but can still proceed
    }

    setUser({ address: addr });
    saveSession({ address: addr });
  }

  function logout() {
    setUser(null);
    clearWalletProvider();
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
