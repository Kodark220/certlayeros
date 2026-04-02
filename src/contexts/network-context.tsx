import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { NETWORKS, DEFAULT_NETWORK, type NetworkId, type NetworkConfig } from "@/lib/contract";
import { switchNetwork as switchGenlayerNetwork } from "@/lib/genlayer";

interface NetworkContextValue {
  networkId: NetworkId;
  network: NetworkConfig;
  switchNetwork: (id: NetworkId) => void;
}

const STORAGE_KEY = "certlayer_network";

function loadNetworkId(): NetworkId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in NETWORKS) return stored as NetworkId;
  } catch {}
  return DEFAULT_NETWORK;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkId, setNetworkId] = useState<NetworkId>(loadNetworkId);

  const switchNetwork = useCallback((id: NetworkId) => {
    setNetworkId(id);
    localStorage.setItem(STORAGE_KEY, id);
    switchGenlayerNetwork(id);
  }, []);

  const network = NETWORKS[networkId];

  return (
    <NetworkContext.Provider value={{ networkId, network, switchNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used within NetworkProvider");
  return ctx;
}
