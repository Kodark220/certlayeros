import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { readContract, toCalldataAddress } from "@/lib/genlayer";
import { NETWORKS } from "@/lib/contract";
import { useNetwork } from "@/contexts/network-context";

export type UserRole = "admin" | "protocol" | "watcher";

export interface ProtocolData {
  name: string;
  website: string;
  token_address: string;
  reputation_score: number;
  promises_kept: number;
  promises_broken: number;
}

export function useRole() {
  const { user } = useAuth();
  const { networkId } = useNetwork();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Check admin first (address match)
      const deployerAddress = NETWORKS[networkId].deployerAddress;
      if (user.address.toLowerCase() === deployerAddress.toLowerCase()) {
        if (!cancelled) {
          setRole("admin");
          setLoading(false);
        }
        return;
      }

      // Check if registered protocol on-chain (overrides chosen role)
      try {
        const raw = await readContract("get_protocol", [toCalldataAddress(user.address)]);
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!cancelled) {
          if (data && data.name) {
            setRole("protocol");
            setProtocolData(data);
          } else {
            // Use the user's chosen role, default to watcher
            setRole(user.chosenRole || "watcher");
          }
        }
      } catch {
        if (!cancelled) setRole(user.chosenRole || "watcher");
      }
      if (!cancelled) setLoading(false);
    }

    setLoading(true);
    detect();
    return () => { cancelled = true; };
  }, [user, networkId]);

  const refreshRole = useCallback(() => {
    setLoading(true);
    setRole(null);
    setProtocolData(null);
    const addr = user?.address;
    if (!addr) { setLoading(false); return; }
    const deployerAddress = NETWORKS[networkId].deployerAddress;
    if (addr.toLowerCase() === deployerAddress.toLowerCase()) {
      setRole("admin");
      setLoading(false);
      return;
    }
    readContract("get_protocol", [toCalldataAddress(addr)])
      .then((raw) => {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (data && data.name) {
          setRole("protocol");
          setProtocolData(data);
        } else {
          setRole(user?.chosenRole || "watcher");
        }
      })
      .catch(() => setRole(user?.chosenRole || "watcher"))
      .finally(() => setLoading(false));
  }, [user, networkId]);

  return { role, loading, protocolData, refreshRole };
}
