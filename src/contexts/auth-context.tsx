import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { createAccount, generatePrivateKey } from "genlayer-js";
import { setAuthAccount, clearAuthAccount } from "@/lib/genlayer";
import { encrypt, decrypt } from "@/lib/crypto";

export type LoginMethod = "email" | "wallet" | "metamask";

export interface AuthUser {
  address: string;
  loginMethod: LoginMethod;
  email?: string;
  privateKey: string;
  walletName?: string;
  externalAddress?: string;
  chosenRole?: "protocol" | "watcher";
}

/** What gets stored in localStorage (no raw private key). */
interface StoredSession {
  address: string;
  loginMethod: LoginMethod;
  email?: string;
  walletName?: string;
  externalAddress?: string;
  chosenRole?: "protocol" | "watcher";
  lastActivity: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  needsUnlock: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithWallet: (password: string, privateKey?: string) => Promise<void>;
  loginWithMetaMask: (password: string) => Promise<void>;
  unlockSession: (password: string) => Promise<void>;
  setChosenRole: (role: "protocol" | "watcher") => void;
  exportPrivateKey: (password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "certlayer_session";
const VAULT_KEY = "certlayer_vault";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// ─── Vault: encrypted key storage ───

async function vaultStore(label: string, privateKey: string, password: string) {
  const vault: Record<string, string> = vaultLoad();
  vault[label] = await encrypt(privateKey, password);
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
}

function vaultLoad(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) || "{}");
  } catch {
    return {};
  }
}

async function vaultGet(label: string, password: string): Promise<string> {
  const vault = vaultLoad();
  const encrypted = vault[label];
  if (!encrypted) throw new Error("No key found for this account");
  return decrypt(encrypted, password);
}

function vaultHas(label: string): boolean {
  const vault = vaultLoad();
  return !!vault[label];
}

// ─── Session helpers ───

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

function isSessionExpired(session: StoredSession): boolean {
  return Date.now() - session.lastActivity > SESSION_TIMEOUT_MS;
}

function vaultLabel(session: StoredSession): string {
  if (session.loginMethod === "email") return `email_${session.email?.toLowerCase()}`;
  if (session.loginMethod === "metamask") return `mm_${session.externalAddress?.toLowerCase()}`;
  return `wallet_${session.address.toLowerCase()}`;
}

// ─── Provider ───

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef<StoredSession | null>(null);

  // Touch session on user activity
  const touchActivity = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.lastActivity = Date.now();
    saveSession(sessionRef.current);
    // Reset timeout
    if (activityTimer.current) clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(lockSession, SESSION_TIMEOUT_MS);
  }, []);

  function lockSession() {
    setUser(null);
    clearAuthAccount();
    setNeedsUnlock(true);
  }

  // Listen for user activity to keep session alive
  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, touchActivity, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, touchActivity));
      if (activityTimer.current) clearTimeout(activityTimer.current);
    };
  }, [touchActivity]);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      if (isSessionExpired(session)) {
        // Session exists but expired — require password
        sessionRef.current = session;
        setNeedsUnlock(true);
      } else {
        // Session alive but key is in encrypted vault — need unlock
        sessionRef.current = session;
        setNeedsUnlock(true);
      }
    }
    setLoading(false);
  }, []);

  async function activateUser(session: StoredSession, privateKey: string) {
    const account = createAccount(privateKey as `0x${string}`);
    const u: AuthUser = {
      address: account.address,
      loginMethod: session.loginMethod,
      email: session.email,
      privateKey,
      walletName: session.walletName,
      externalAddress: session.externalAddress,
      chosenRole: session.chosenRole,
    };
    setUser(u);
    setNeedsUnlock(false);
    setAuthAccount(privateKey);
    session.lastActivity = Date.now();
    sessionRef.current = session;
    saveSession(session);
    // Start timeout
    if (activityTimer.current) clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(lockSession, SESSION_TIMEOUT_MS);
  }

  async function loginWithEmail(email: string, password: string) {
    const label = `email_${email.toLowerCase()}`;
    let pk: string;
    if (vaultHas(label)) {
      pk = await vaultGet(label, password);
    } else {
      pk = generatePrivateKey();
      await vaultStore(label, pk, password);
    }
    const account = createAccount(pk as `0x${string}`);
    const session: StoredSession = {
      address: account.address,
      loginMethod: "email",
      email,
      lastActivity: Date.now(),
    };
    saveSession(session);
    await activateUser(session, pk);
  }

  async function loginWithWallet(password: string, privateKey?: string) {
    const pk = privateKey || generatePrivateKey();
    const account = createAccount(pk as `0x${string}`);
    const label = `wallet_${account.address.toLowerCase()}`;
    await vaultStore(label, pk, password);
    const session: StoredSession = {
      address: account.address,
      loginMethod: "wallet",
      walletName: privateKey ? "Imported Wallet" : "Generated Wallet",
      lastActivity: Date.now(),
    };
    saveSession(session);
    await activateUser(session, pk);
  }

  async function loginWithMetaMask(password: string) {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not detected");
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts.length) throw new Error("No accounts returned");
    const mmAddr = accounts[0].toLowerCase();
    const label = `mm_${mmAddr}`;
    let pk: string;
    if (vaultHas(label)) {
      pk = await vaultGet(label, password);
    } else {
      pk = generatePrivateKey();
      await vaultStore(label, pk, password);
    }
    const account = createAccount(pk as `0x${string}`);
    const session: StoredSession = {
      address: account.address,
      loginMethod: "metamask",
      walletName: "MetaMask",
      externalAddress: mmAddr,
      lastActivity: Date.now(),
    };
    saveSession(session);
    await activateUser(session, pk);
  }

  async function unlockSession(password: string) {
    const session = sessionRef.current || loadSession();
    if (!session) throw new Error("No session to unlock");
    const label = vaultLabel(session);
    const pk = await vaultGet(label, password);
    await activateUser(session, pk);
  }

  async function exportPrivateKey(password: string): Promise<string> {
    const session = sessionRef.current || loadSession();
    if (!session) throw new Error("No active session");
    const label = vaultLabel(session);
    return vaultGet(label, password);
  }

  function logout() {
    setUser(null);
    setNeedsUnlock(false);
    sessionRef.current = null;
    clearAuthAccount();
    clearSession();
    if (activityTimer.current) clearTimeout(activityTimer.current);
  }

  function setChosenRole(role: "protocol" | "watcher") {
    if (!user) return;
    const updated = { ...user, chosenRole: role };
    setUser(updated);
    if (sessionRef.current) {
      sessionRef.current.chosenRole = role;
      saveSession(sessionRef.current);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        needsUnlock,
        loginWithEmail,
        loginWithWallet,
        loginWithMetaMask,
        unlockSession,
        setChosenRole,
        exportPrivateKey,
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
